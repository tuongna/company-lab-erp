#!/usr/bin/env python3
"""Full-coverage audit of the legacy IT Operations workbook (.xlsx).

Stdlib only (no openpyxl). Checks every row, unlike the workbook's own
DataChecks sheet. Writes a Markdown report.

Usage:
  python3 audit_workbook.py "raw/IT Operations - Legacy Demo.xlsx" [--out docs/data-audit/report.md]
Exit code: 0 = no FAIL checks, 1 = at least one FAIL.
"""
from __future__ import annotations

import argparse
import collections
import datetime as dt
import posixpath
import re
import sys
import xml.etree.ElementTree as ET
import zipfile

NS = "{http://schemas.openxmlformats.org/spreadsheetml/2006/main}"
RID = "{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id"
PKG = "{http://schemas.openxmlformats.org/package/2006/relationships}"

# Expected domain (see .agents/rules/domain-glossary.md)
REQUEST_TYPES = {"Laptop allocation", "Laptop return", "Laptop repair"}
REQUEST_STATUSES = {"Pending approval", "Approved", "In progress", "Completed", "Rejected", "Cancelled"}
ASSET_TYPES = {"Laptop", "Monitor"}
ASSET_STATUSES = {"Available", "Assigned"}
ROLES = {"Employee", "Manager", "Operator"}
TRANSITIONS = {
    ("", "Pending approval"),
    ("Pending approval", "Approved"),
    ("Pending approval", "Rejected"),
    ("Pending approval", "Cancelled"),
    ("Approved", "In progress"),
    ("In progress", "Completed"),
}
TERMINAL = {"Completed", "Rejected", "Cancelled"}
EXCEL_EPOCH = dt.datetime(1899, 12, 30)


# ---------------------------------------------------------------- xlsx reader
class Cell:
    __slots__ = ("ref", "value", "formula")

    def __init__(self, ref: str, value: str, formula: str | None):
        self.ref, self.value, self.formula = ref, value, formula


class Sheet:
    def __init__(self, name: str, rows: list[dict[str, Cell]], comments: list[tuple[str, str]]):
        self.name = name
        self.raw_rows = rows
        self.comments = comments
        header = rows[0] if rows else {}
        self.columns = {col: c.value.strip() for col, c in header.items()}
        self.records: list[dict] = []
        for r in rows[1:]:
            rec = {self.columns.get(col, col): c.value.strip() for col, c in r.items()}
            if any(rec.values()):
                rec["__row"] = re.sub(r"[A-Z]+", "", next(iter(r.values())).ref)
                self.records.append(rec)


def _col(ref: str) -> str:
    return "".join(ch for ch in ref if ch.isalpha())


def load_workbook(path: str) -> dict[str, Sheet]:
    z = zipfile.ZipFile(path)
    names = set(z.namelist())
    shared: list[str] = []
    if "xl/sharedStrings.xml" in names:
        for si in ET.fromstring(z.read("xl/sharedStrings.xml")).findall(NS + "si"):
            shared.append("".join(t.text or "" for t in si.iter(NS + "t")))
    wb = ET.fromstring(z.read("xl/workbook.xml"))
    rels = {r.attrib["Id"]: r.attrib["Target"] for r in ET.fromstring(z.read("xl/_rels/workbook.xml.rels"))}

    def resolve(base: str, target: str) -> str:
        if target.startswith("/"):
            return target.lstrip("/")
        return posixpath.normpath(posixpath.join(posixpath.dirname(base), target))

    sheets: dict[str, Sheet] = {}
    for s in wb.iter(NS + "sheet"):
        path_ = resolve("xl/workbook.xml", rels[s.attrib[RID]])
        rows: list[dict[str, Cell]] = []
        for r in ET.fromstring(z.read(path_)).iter(NS + "row"):
            row: dict[str, Cell] = {}
            for c in r.findall(NS + "c"):
                v, f = c.find(NS + "v"), c.find(NS + "f")
                val = v.text if v is not None and v.text is not None else ""
                if c.attrib.get("t") == "s" and val:
                    val = shared[int(val)]
                elif c.attrib.get("t") == "inlineStr":
                    val = "".join(t.text or "" for t in c.iter(NS + "t"))
                row[_col(c.attrib["r"])] = Cell(c.attrib["r"], val, f.text if f is not None else None)
            rows.append(row)
        comments: list[tuple[str, str]] = []
        rel_path = posixpath.join(posixpath.dirname(path_), "_rels", posixpath.basename(path_) + ".rels")
        if rel_path in names:
            for rel in ET.fromstring(z.read(rel_path)).findall(PKG + "Relationship"):
                if rel.attrib["Type"].endswith("/comments"):
                    for cm in ET.fromstring(z.read(resolve(path_, rel.attrib["Target"]))).iter(NS + "comment"):
                        comments.append((cm.attrib.get("ref", ""), "".join(t.text or "" for t in cm.iter(NS + "t"))))
        sheets[s.attrib["name"]] = Sheet(s.attrib["name"], rows, comments)
    return sheets


# ---------------------------------------------------------------- checks
class Report:
    def __init__(self):
        self.results: list[tuple[str, str, int, str, list[str]]] = []

    def add(self, group: str, name: str, issues: list[str], level: str = "FAIL"):
        status = "PASS" if not issues else level
        self.results.append((group, name, len(issues), status, issues[:5]))

    @property
    def failed(self) -> bool:
        return any(r[3] == "FAIL" for r in self.results)


def is_num(v: str) -> bool:
    try:
        float(v)
        return True
    except ValueError:
        return False


def serial_to_local(v: str) -> str:
    return (EXCEL_EPOCH + dt.timedelta(days=float(v))).strftime("%Y-%m-%d %H:%M")


def audit(sheets: dict[str, Sheet]) -> tuple[Report, dict]:
    rep = Report()
    get = lambda n: sheets[n].records if n in sheets else []  # noqa: E731
    emp, eq, req, hist, att = (get(n) for n in ("Employees", "Equipment", "Requests", "RequestHistory", "Attachments"))
    emp_ids = {e["employee_id"] for e in emp}
    eq_by = {a["asset_id"]: a for a in eq}
    req_by = {r["request_id"]: r for r in req}

    # Duplicates
    for label, rows, key in (("Employees", emp, "employee_id"), ("Equipment", eq, "asset_id"),
                             ("Requests", req, "request_id"), ("RequestHistory", hist, "event_id")):
        cnt = collections.Counter(r.get(key, "") for r in rows)
        rep.add("Keys", f"{label}.{key} unique & non-empty",
                [f"{k or '<empty>'} ×{v}" for k, v in cnt.items() if v > 1 or not k])

    # Enums
    for label, rows, col, allowed in (
        ("Requests", req, "request_type", REQUEST_TYPES), ("Requests", req, "status", REQUEST_STATUSES),
        ("Equipment", eq, "type", ASSET_TYPES), ("Equipment", eq, "status", ASSET_STATUSES),
        ("Employees", emp, "role", ROLES),
        ("RequestHistory", hist, "to_status", REQUEST_STATUSES),
        ("RequestHistory", hist, "from_status", REQUEST_STATUSES | {""}),
    ):
        rep.add("Enums", f"{label}.{col} in allowed set",
                [f"row {r['__row']}: {r.get(col, '')!r}" for r in rows if r.get(col, "") not in allowed])

    # Foreign keys + column shift
    def fk(label, rows, col, target, optional=True):
        issues = []
        for r in rows:
            v = r.get(col, "")
            if not v and optional:
                continue
            if v not in target:
                hint = " (numeric → likely column shift)" if is_num(v) else ""
                issues.append(f"row {r['__row']}: {v!r}{hint}")
        rep.add("References", f"{label}.{col} exists", issues)

    fk("Requests", req, "employee_id", emp_ids, optional=False)
    fk("Requests", req, "assigned_to", emp_ids)
    fk("Requests", req, "asset_id", eq_by)
    fk("RequestHistory", hist, "request_id", req_by, optional=False)
    fk("RequestHistory", hist, "actor_id", emp_ids, optional=False)
    fk("Equipment", eq, "holder_id", emp_ids)
    fk("Attachments", att, "request_id", req_by, optional=False)

    # Timestamps
    for label, rows, col in (("Requests", req, "created_at"), ("RequestHistory", hist, "occurred_at")):
        rep.add("Time", f"{label}.{col} is a date serial",
                [f"row {r['__row']}: {r.get(col, '')!r}" for r in rows if not is_num(r.get(col, ""))])

    # Asset invariants
    rep.add("Asset", "Assigned ⇒ holder present",
            [a["asset_id"] for a in eq if a.get("status") == "Assigned" and not a.get("holder_id")])
    rep.add("Asset", "Available ⇒ holder empty",
            [a["asset_id"] for a in eq if a.get("status") == "Available" and a.get("holder_id")])
    laptops = collections.Counter(a["holder_id"] for a in eq
                                  if a.get("type") == "Laptop" and a.get("status") == "Assigned" and a.get("holder_id"))
    rep.add("Asset", "≤ 1 assigned laptop per employee", [f"{k} holds {v}" for k, v in laptops.items() if v > 1])

    # Request ↔ asset rules
    issues = []
    for r in req:
        t, s, a = r.get("request_type"), r.get("status"), r.get("asset_id")
        if t == "Laptop allocation" and s == "Completed" and not a:
            issues.append(f"{r['request_id']}: completed allocation without asset")
        if t in ("Laptop return", "Laptop repair") and not a:
            issues.append(f"{r['request_id']}: {t} without asset")
    rep.add("Request", "asset_id present when required", issues)

    # History: transitions, chains, drift
    by_req: dict[str, list[dict]] = collections.defaultdict(list)
    for h in hist:
        by_req[h.get("request_id", "")].append(h)
    bad_tr, broken, drift, no_hist = [], [], [], []
    for rid, events in by_req.items():
        events.sort(key=lambda h: float(h["occurred_at"]) if is_num(h.get("occurred_at", "")) else 0.0)
        prev = ""
        for h in events:
            pair = (h.get("from_status", ""), h.get("to_status", ""))
            if pair not in TRANSITIONS:
                bad_tr.append(f"{h.get('event_id')}: {pair[0] or '∅'} → {pair[1] or '∅'}")
            if pair[0] != prev:
                broken.append(f"{rid} at {h.get('event_id')}: expected from {prev or '∅'!r}, got {pair[0] or '∅'!r}")
            if prev in TERMINAL:
                broken.append(f"{rid}: transition after terminal {prev}")
            prev = pair[1]
        if rid in req_by and req_by[rid].get("status") != prev:
            drift.append(f"{rid}: status={req_by[rid].get('status')!r}, latest event={prev!r}")
    for rid in req_by:
        if rid not in by_req:
            no_hist.append(rid)
    rep.add("History", "every transition allowed by FSM", bad_tr)
    rep.add("History", "event chain continuous (from = previous to)", broken)
    rep.add("History", "request status = latest event", drift)
    rep.add("History", "every request has history", no_hist)

    # Workbook-level: stale formulas & hardcoded checks
    data_rows = {n: len(s.records) + 1 for n, s in sheets.items()}  # incl. header
    rng = re.compile(r"(?:'([^']+)'|([A-Za-z_]+))!\$?[A-Z]+\$?(\d+):\$?[A-Z]+\$?(\d+)")
    short = []
    for s in sheets.values():
        for row in s.raw_rows:
            for c in row.values():
                for m in rng.finditer(c.formula or ""):
                    target, end = m.group(1) or m.group(2), int(m.group(4))
                    if target in data_rows and end < data_rows[target]:
                        short.append(f"{s.name}!{c.ref} covers {target} to row {end}, data ends at row {data_rows[target]}")
    rep.add("Workbook", "formula ranges cover all data rows", sorted(set(short)), level="WARN")
    if "DataChecks" in sheets:
        hard = [f"DataChecks!{c.ref} = {c.value!r} ({row.get('A').value if row.get('A') else ''})"
                for row in sheets["DataChecks"].raw_rows[1:] for col, c in row.items()
                if col == "B" and c.value and not c.formula]
        rep.add("Workbook", "DataChecks results are formulas (not hardcoded)", hard, level="WARN")

    stats = {
        "rows": {n: len(s.records) for n, s in sheets.items()},
        "comments": {n: len(s.comments) for n, s in sheets.items() if s.comments},
        "comment_samples": [(n, ref, txt[:160]) for n, s in sheets.items()
                            for ref, txt in s.comments[:2]],
        "requests_by_type_status": collections.Counter((r.get("request_type"), r.get("status")) for r in req),
        "time_range": (
            min((float(r["created_at"]) for r in req if is_num(r.get("created_at", ""))), default=None),
            max((float(h["occurred_at"]) for h in hist if is_num(h.get("occurred_at", ""))), default=None),
        ),
    }
    return rep, stats


# ---------------------------------------------------------------- output
def render(path: str, rep: Report, stats: dict) -> str:
    out = [f"# Legacy workbook audit\n", f"- Source: `{path}`",
           f"- Generated: {dt.datetime.now().astimezone().isoformat(timespec='seconds')}",
           f"- Result: **{'FAIL' if rep.failed else 'PASS'}** "
           f"({sum(r[3] == 'FAIL' for r in rep.results)} fail, {sum(r[3] == 'WARN' for r in rep.results)} warn, "
           f"{sum(r[3] == 'PASS' for r in rep.results)} pass)\n",
           "## Row counts (non-blank)\n", "| Sheet | Rows | Comments |", "|---|---:|---:|"]
    for n, c in stats["rows"].items():
        out.append(f"| {n} | {c} | {stats['comments'].get(n, 0)} |")
    lo, hi = stats["time_range"]
    if lo is not None and hi is not None:
        out.append(f"\nTime range (local wall-clock): {serial_to_local(lo)} → {serial_to_local(hi)}\n")
    out += ["## Checks\n", "| Group | Check | Status | Count | Samples |", "|---|---|---|---:|---|"]
    for g, n, cnt, st, samples in rep.results:
        icon = {"PASS": "✅", "WARN": "⚠️", "FAIL": "❌"}[st]
        smp = "<br>".join(s.replace("|", "\\|") for s in samples)
        out.append(f"| {g} | {n} | {icon} {st} | {cnt} | {smp} |")
    out += ["\n## Requests by type × status\n", "| Type | Status | Count |", "|---|---|---:|"]
    for (t, s), c in sorted(stats["requests_by_type_status"].items(), key=lambda x: (str(x[0][0]), str(x[0][1]))):
        out.append(f"| {t} | {s} | {c} |")
    if stats["comment_samples"]:
        out += ["\n## Comment samples\n"]
        out += [f"- `{n}!{ref}`: {txt}" for n, ref, txt in stats["comment_samples"]]
    return "\n".join(out) + "\n"


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("xlsx")
    ap.add_argument("--out", help="write Markdown report to this path (default: stdout)")
    args = ap.parse_args()
    rep, stats = audit(load_workbook(args.xlsx))
    md = render(args.xlsx, rep, stats)
    if args.out:
        import os
        os.makedirs(os.path.dirname(args.out) or ".", exist_ok=True)
        with open(args.out, "w", encoding="utf-8") as f:
            f.write(md)
        print(f"Report written to {args.out} — {'FAIL' if rep.failed else 'PASS'}")
    else:
        sys.stdout.write(md)
    return 1 if rep.failed else 0


if __name__ == "__main__":
    sys.exit(main())

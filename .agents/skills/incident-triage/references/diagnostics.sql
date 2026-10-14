-- Diagnostic queries for incident-triage. Read-only. Adjust names to the
-- actual schema if it diverged (check migrations).

-- §1 Latest sync runs and quarantine breakdown
SELECT id, started_at, finished_at, status, source_rows, upserted, unchanged, quarantined
FROM legacy_sync.sync_run
ORDER BY started_at DESC
LIMIT 10;

SELECT sheet, reason, count(*) AS rows, min(created_at) AS first_seen
FROM legacy_sync.quarantine
WHERE sync_run_id = (SELECT id FROM legacy_sync.sync_run ORDER BY started_at DESC LIMIT 1)
GROUP BY sheet, reason
ORDER BY rows DESC;

-- §2 Full history of one request (business timezone)
SELECT h.occurred_at AT TIME ZONE 'Asia/Ho_Chi_Minh' AS occurred_local,
       h.from_status, h.to_status, e.legacy_id AS actor, h.note
FROM request_history h
JOIN service_request r ON r.id = h.request_id
LEFT JOIN employee e ON e.id = h.actor_employee_id
WHERE r.legacy_id = :request_code OR r.code = :request_code
ORDER BY h.occurred_at, h.id;

-- §3 Status drift: request.status differs from latest history event
SELECT r.code, r.status, latest.to_status AS latest_event_status, latest.occurred_at
FROM service_request r
JOIN LATERAL (
  SELECT to_status, occurred_at
  FROM request_history h
  WHERE h.request_id = r.id
  ORDER BY occurred_at DESC, id DESC
  LIMIT 1
) latest ON true
WHERE r.status <> latest.to_status;

-- §3b Requests stuck in a non-terminal status for > 3 days
SELECT status, count(*) AS stuck, min(updated_at) AS oldest
FROM service_request
WHERE status IN ('PENDING_APPROVAL', 'APPROVED', 'IN_PROGRESS')
  AND updated_at < now() - interval '3 days'
GROUP BY status;

-- §4 Asset invariants (should all return 0 rows; constraints should prevent them)
SELECT holder_employee_id, count(*) FROM asset
WHERE type = 'LAPTOP' AND status = 'ASSIGNED'
GROUP BY holder_employee_id HAVING count(*) > 1;

SELECT a.legacy_id, a.status, a.holder_employee_id FROM asset a
WHERE (a.status = 'ASSIGNED' AND a.holder_employee_id IS NULL)
   OR (a.status = 'AVAILABLE' AND a.holder_employee_id IS NOT NULL);

-- Completed allocations whose asset is not held by the requester
SELECT r.code, a.legacy_id AS asset, a.holder_employee_id, r.requester_employee_id
FROM service_request r
JOIN asset a ON a.id = r.asset_id
WHERE r.type = 'ALLOCATION' AND r.status = 'COMPLETED'
  AND a.holder_employee_id IS DISTINCT FROM r.requester_employee_id
  AND NOT EXISTS (                      -- ignore if a later return completed
    SELECT 1 FROM service_request r2
    WHERE r2.asset_id = r.asset_id AND r2.type = 'RETURN'
      AND r2.status = 'COMPLETED' AND r2.created_at > r.created_at);

-- §5 Slowest statements (requires pg_stat_statements)
SELECT calls, round(mean_exec_time::numeric, 1) AS mean_ms,
       round(total_exec_time::numeric, 0) AS total_ms, left(query, 160) AS query
FROM pg_stat_statements
ORDER BY total_exec_time DESC
LIMIT 15;

-- Active locks / blocked sessions
SELECT pid, now() - query_start AS running_for, wait_event_type, state, left(query, 120)
FROM pg_stat_activity
WHERE state <> 'idle' AND pid <> pg_backend_pid()
ORDER BY query_start;

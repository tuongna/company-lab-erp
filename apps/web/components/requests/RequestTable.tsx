import React from 'react';
import { ChevronRight } from 'lucide-react';
import { ServiceRequestItem, ServiceRequestType } from '@companylab/contracts';
import { RequestStatusBadge } from './RequestStatusBadge';
import { useTranslation } from '@/lib/i18n/context';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface RequestTableProps {
  items: ServiceRequestItem[];
  selectedId: string | null;
  loading: boolean;
  page: number;
  totalPages: number;
  onSelect: (item: ServiceRequestItem) => void;
  onPageChange: (newPage: number) => void;
}

export function RequestTable({
  items,
  selectedId,
  loading,
  page,
  totalPages,
  onSelect,
  onPageChange,
}: RequestTableProps) {
  const { t } = useTranslation();

  const getTypeText = (type: ServiceRequestType) => {
    switch (type) {
      case ServiceRequestType.ALLOCATION:
        return t.itService.typeAllocation;
      case ServiceRequestType.RETURN:
        return t.itService.typeReturn;
      case ServiceRequestType.REPAIR:
        return t.itService.typeRepair;
      default:
        return type;
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="relative flex-1 overflow-x-auto">
        <Table>
          <TableHeader>
            <tr>
              <TableHead preset="code">{t.itService.colCode}</TableHead>
              <TableHead preset="badge">{t.itService.colType}</TableHead>
              <TableHead preset="person">{t.itService.colEmployee}</TableHead>
              <TableHead preset="badge">{t.itService.colStatus}</TableHead>
              <TableHead preset="content">{t.itService.colAsset}</TableHead>
              <TableHead preset="actions">{t.itService.colDetails}</TableHead>
            </tr>
          </TableHeader>
          <TableBody>
            {loading && items.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-muted">
                  {t.common.loading}
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-muted">
                  {t.common.noData}
                </td>
              </tr>
            ) : (
              items.map((r) => (
                <TableRow
                  key={r.id}
                  onClick={() => onSelect(r)}
                  className={`cursor-pointer ${selectedId === r.id ? 'bg-primary/10' : ''}`}
                >
                  <TableCell preset="code" className="text-foreground">
                    {r.legacyId || r.id.slice(0, 8)}
                  </TableCell>
                  <TableCell preset="badge" className="font-medium text-foreground">
                    {getTypeText(r.requestType)}
                  </TableCell>
                  <TableCell preset="person">
                    <div className="font-medium text-foreground">{r.employee?.name || '—'}</div>
                    <div className="text-sm text-muted">{r.employee?.department}</div>
                  </TableCell>
                  <TableCell preset="badge">
                    <RequestStatusBadge status={r.status} />
                  </TableCell>
                  <TableCell preset="content" className="text-muted">
                    {r.asset ? `${r.asset.model} (${r.asset.legacyId || 'No Code'})` : '—'}
                  </TableCell>
                  <TableCell preset="actions">
                    <ChevronRight className="inline h-4 w-4 text-muted" />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between rounded-b-xl border-t border-border bg-surface-subtle p-3 text-xs">
        <button
          type="button"
          disabled={page <= 1 || loading}
          onClick={() => onPageChange(Math.max(page - 1, 1))}
          className="shadow-xs rounded-lg border border-border bg-surface px-3 py-1 text-foreground transition hover:bg-surface-subtle disabled:opacity-50"
        >
          {t.common.previousPage}
        </button>
        <span className="text-muted">
          {t.common.page} <strong className="text-foreground">{page}</strong> {t.common.of}{' '}
          {totalPages || 1}
        </span>
        <button
          type="button"
          disabled={page >= totalPages || loading}
          onClick={() => onPageChange(Math.min(page + 1, totalPages))}
          className="shadow-xs rounded-lg border border-border bg-surface px-3 py-1 text-foreground transition hover:bg-surface-subtle disabled:opacity-50"
        >
          {t.common.nextPage}
        </button>
      </div>
    </div>
  );
}

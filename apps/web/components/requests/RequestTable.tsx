import React from 'react';
import { ChevronRight } from 'lucide-react';
import { ServiceRequestItem, ServiceRequestType } from '@companylab/contracts';
import { RequestStatusBadge } from './RequestStatusBadge';
import { useTranslation } from '@/lib/i18n/context';

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
      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-surface-subtle text-sm font-semibold uppercase text-muted">
            <tr>
              <th className="px-4 py-3">{t.itService.colCode}</th>
              <th className="px-4 py-3">{t.itService.colType}</th>
              <th className="px-4 py-3">{t.itService.colEmployee}</th>
              <th className="px-4 py-3">{t.itService.colStatus}</th>
              <th className="px-4 py-3">{t.itService.colAsset}</th>
              <th className="px-4 py-3 text-right">{t.itService.colDetails}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
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
                <tr
                  key={r.id}
                  onClick={() => onSelect(r)}
                  className={`cursor-pointer transition hover:bg-surface-subtle ${
                    selectedId === r.id ? 'bg-primary/10' : ''
                  }`}
                >
                  <td className="px-4 py-3 font-mono font-medium text-foreground">
                    {r.legacyId || r.id.slice(0, 8)}
                  </td>
                  <td className="px-4 py-3 font-medium text-foreground">
                    {getTypeText(r.requestType)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground">{r.employee?.name || '—'}</div>
                    <div className="text-sm text-muted">{r.employee?.department}</div>
                  </td>
                  <td className="px-4 py-3">
                    <RequestStatusBadge status={r.status} />
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {r.asset ? `${r.asset.model} (${r.asset.legacyId || 'No Code'})` : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <ChevronRight className="inline h-4 w-4 text-muted" />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between border-t border-border bg-surface-subtle p-3 text-xs">
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

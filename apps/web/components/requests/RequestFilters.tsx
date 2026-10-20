import React from 'react';
import { ServiceRequestStatus, ServiceRequestType } from '@companylab/contracts';
import { useTranslation } from '@/lib/i18n/context';

interface RequestFiltersProps {
  status: string;
  type: string;
  page: number;
  totalPages: number;
  onStatusChange: (status: string) => void;
  onTypeChange: (type: string) => void;
}

export function RequestFilters({
  status,
  type,
  page,
  totalPages,
  onStatusChange,
  onTypeChange,
}: RequestFiltersProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-surface-subtle p-4 text-xs">
      <div className="flex items-center gap-2">
        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          aria-label={t.itService.filterAllStatus}
          suppressHydrationWarning
          className="shadow-xs rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="">{t.itService.filterAllStatus}</option>
          <option value={ServiceRequestStatus.PENDING_APPROVAL}>
            {t.itService.pendingApproval}
          </option>
          <option value={ServiceRequestStatus.APPROVED}>{t.itService.statusApproved}</option>
          <option value={ServiceRequestStatus.IN_PROGRESS}>{t.itService.inProgress}</option>
          <option value={ServiceRequestStatus.COMPLETED}>{t.itService.statusCompleted}</option>
          <option value={ServiceRequestStatus.REJECTED}>{t.itService.statusRejected}</option>
          <option value={ServiceRequestStatus.CANCELLED}>{t.itService.statusCancelled}</option>
        </select>

        <select
          value={type}
          onChange={(e) => onTypeChange(e.target.value)}
          aria-label={t.itService.filterAllTypes}
          suppressHydrationWarning
          className="shadow-xs rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="">{t.itService.filterAllTypes}</option>
          <option value={ServiceRequestType.ALLOCATION}>{t.itService.typeAllocation}</option>
          <option value={ServiceRequestType.RETURN}>{t.itService.typeReturn}</option>
          <option value={ServiceRequestType.REPAIR}>{t.itService.typeRepair}</option>
        </select>
      </div>

      <span className="text-xs text-muted">
        {t.common.page} <strong className="text-foreground">{page}</strong> {t.common.of}{' '}
        {totalPages || 1}
      </span>
    </div>
  );
}

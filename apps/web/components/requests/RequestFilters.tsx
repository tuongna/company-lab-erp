import React from 'react';
import { ServiceRequestStatus, ServiceRequestType } from '@companylab/contracts';
import { useTranslation } from '@/lib/i18n/context';
import { Select } from '@/components/ui/select';

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

  const statusOptions = [
    { value: '', label: t.itService.filterAllStatus },
    { value: ServiceRequestStatus.PENDING_APPROVAL, label: t.itService.pendingApproval },
    { value: ServiceRequestStatus.APPROVED, label: t.itService.statusApproved },
    { value: ServiceRequestStatus.IN_PROGRESS, label: t.itService.inProgress },
    { value: ServiceRequestStatus.COMPLETED, label: t.itService.statusCompleted },
    { value: ServiceRequestStatus.REJECTED, label: t.itService.statusRejected },
    { value: ServiceRequestStatus.CANCELLED, label: t.itService.statusCancelled },
  ];

  const typeOptions = [
    { value: '', label: t.itService.filterAllTypes },
    { value: ServiceRequestType.ALLOCATION, label: t.itService.typeAllocation },
    { value: ServiceRequestType.RETURN, label: t.itService.typeReturn },
    { value: ServiceRequestType.REPAIR, label: t.itService.typeRepair },
  ];

  return (
    <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 rounded-t-xl border-b border-border bg-surface-subtle p-4 text-xs">
      <div className="flex items-center gap-2">
        <Select
          value={status}
          onChange={onStatusChange}
          options={statusOptions}
          ariaLabel={t.itService.filterAllStatus}
          triggerClassName="min-w-[130px]"
        />

        <Select
          value={type}
          onChange={onTypeChange}
          options={typeOptions}
          ariaLabel={t.itService.filterAllTypes}
          triggerClassName="min-w-[130px]"
        />
      </div>

      <span className="text-xs text-muted">
        {t.common.page} <strong className="text-foreground">{page}</strong> {t.common.of}{' '}
        {totalPages || 1}
      </span>
    </div>
  );
}

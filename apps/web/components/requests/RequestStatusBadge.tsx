'use client';

import React from 'react';
import { ServiceRequestStatus } from '@companylab/contracts';

interface RequestStatusBadgeProps {
  status: ServiceRequestStatus;
}

export function RequestStatusBadge({ status }: RequestStatusBadgeProps) {
  let badgeStyle =
    'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';

  switch (status) {
    case ServiceRequestStatus.COMPLETED:
      badgeStyle =
        'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800/60';
      break;
    case ServiceRequestStatus.IN_PROGRESS:
      badgeStyle =
        'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800/60';
      break;
    case ServiceRequestStatus.PENDING_APPROVAL:
      badgeStyle =
        'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800/60';
      break;
    case ServiceRequestStatus.APPROVED:
      badgeStyle =
        'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-400 dark:border-indigo-800/60';
      break;
    case ServiceRequestStatus.REJECTED:
      badgeStyle =
        'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-400 dark:border-rose-800/60';
      break;
    case ServiceRequestStatus.CANCELLED:
      badgeStyle =
        'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700';
      break;
  }

  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border ${badgeStyle}`}
    >
      {status}
    </span>
  );
}

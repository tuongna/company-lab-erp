'use client';

import React from 'react';
import { ServiceRequestStatus } from '@companylab/contracts';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n/context';

export const requestStatusBadgeVariants = cva(
  'inline-block px-2.5 py-0.5 rounded-full text-sm font-semibold border transition-colors',
  {
    variants: {
      status: {
        [ServiceRequestStatus.COMPLETED]:
          'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800/60',
        [ServiceRequestStatus.IN_PROGRESS]:
          'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800/60',
        [ServiceRequestStatus.PENDING_APPROVAL]:
          'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800/60',
        [ServiceRequestStatus.APPROVED]:
          'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-400 dark:border-indigo-800/60',
        [ServiceRequestStatus.REJECTED]:
          'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-400 dark:border-rose-800/60',
        [ServiceRequestStatus.CANCELLED]:
          'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
      },
    },
    defaultVariants: {
      status: ServiceRequestStatus.PENDING_APPROVAL,
    },
  },
);

export interface RequestStatusBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof requestStatusBadgeVariants> {
  status: ServiceRequestStatus;
}

export function RequestStatusBadge({
  status,
  children,
  className,
  ...props
}: RequestStatusBadgeProps) {
  const { t } = useTranslation();

  const getStatusLabel = (s: ServiceRequestStatus) => {
    switch (s) {
      case ServiceRequestStatus.PENDING_APPROVAL:
        return t.itService.pendingApproval;
      case ServiceRequestStatus.APPROVED:
        return t.itService.statusApproved;
      case ServiceRequestStatus.IN_PROGRESS:
        return t.itService.inProgress;
      case ServiceRequestStatus.COMPLETED:
        return t.itService.statusCompleted;
      case ServiceRequestStatus.REJECTED:
        return t.itService.statusRejected;
      case ServiceRequestStatus.CANCELLED:
        return t.itService.statusCancelled;
      default:
        return s;
    }
  };

  return (
    <span className={cn(requestStatusBadgeVariants({ status }), className)} {...props}>
      {children ?? getStatusLabel(status)}
    </span>
  );
}

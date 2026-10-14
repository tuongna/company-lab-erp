'use client';

import React from 'react';
import { ServiceRequestStatus } from '@companylab/contracts';

interface RequestStatusBadgeProps {
  status: ServiceRequestStatus;
}

export function RequestStatusBadge({ status }: RequestStatusBadgeProps) {
  let badgeStyle = 'bg-slate-100 text-slate-700 border-slate-200';

  switch (status) {
    case ServiceRequestStatus.COMPLETED:
      badgeStyle = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      break;
    case ServiceRequestStatus.IN_PROGRESS:
      badgeStyle = 'bg-blue-50 text-blue-700 border-blue-200';
      break;
    case ServiceRequestStatus.PENDING_APPROVAL:
      badgeStyle = 'bg-amber-50 text-amber-700 border-amber-200';
      break;
    case ServiceRequestStatus.APPROVED:
      badgeStyle = 'bg-indigo-50 text-indigo-700 border-indigo-200';
      break;
    case ServiceRequestStatus.REJECTED:
      badgeStyle = 'bg-rose-50 text-rose-700 border-rose-200';
      break;
    case ServiceRequestStatus.CANCELLED:
      badgeStyle = 'bg-slate-100 text-slate-600 border-slate-200';
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

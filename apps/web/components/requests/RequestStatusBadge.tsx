'use client';

import React from 'react';
import { ServiceRequestStatus } from '@companylab/contracts';
import { Badge, type BadgeProps, type BadgeTone } from '@/components/ui/badge';
import { useTranslation } from '@/lib/i18n/context';

export const STATUS_TONE_MAP: Record<ServiceRequestStatus, BadgeTone> = {
  [ServiceRequestStatus.COMPLETED]: 'success',
  [ServiceRequestStatus.IN_PROGRESS]: 'info',
  [ServiceRequestStatus.PENDING_APPROVAL]: 'warning',
  [ServiceRequestStatus.APPROVED]: 'indigo',
  [ServiceRequestStatus.REJECTED]: 'danger',
  [ServiceRequestStatus.CANCELLED]: 'neutral',
};

export interface RequestStatusBadgeProps extends Omit<BadgeProps, 'tone'> {
  status: ServiceRequestStatus;
}

export function RequestStatusBadge({
  status,
  children,
  size = 'md',
  showDot = true,
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

  const tone = STATUS_TONE_MAP[status] ?? 'neutral';

  return (
    <Badge tone={tone} size={size} showDot={showDot} {...props}>
      {children ?? getStatusLabel(status)}
    </Badge>
  );
}

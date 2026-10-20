'use client';

import React from 'react';
import { Layers } from 'lucide-react';
import {
  ServiceRequestItem,
  ServiceRequestStatus,
  ServiceRequestType,
} from '@companylab/contracts';
import { useTranslation } from '@/lib/i18n/context';

interface RequestTimelineProps {
  request: ServiceRequestItem | null;
  loading?: boolean;
}

export function RequestTimeline({ request, loading }: RequestTimelineProps) {
  const { t, locale } = useTranslation();
  const dateLocaleStr = locale === 'ko' ? 'ko-KR' : locale === 'en' ? 'en-US' : 'vi-VN';

  const getTypeText = (type?: ServiceRequestType) => {
    if (!type) return '';
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

  const getStatusLabel = (s: ServiceRequestStatus | string) => {
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

  if (loading) {
    return (
      <div className="flex animate-pulse flex-col rounded-xl border border-border bg-surface p-6 shadow-[var(--card-shadow)]">
        <div className="mb-4 h-5 w-1/2 rounded bg-surface-subtle" />
        <div className="mb-6 h-24 rounded bg-surface-subtle" />
        <div className="space-y-4">
          <div className="h-10 rounded bg-surface-subtle" />
          <div className="h-10 rounded bg-surface-subtle" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col rounded-xl border border-border bg-surface p-6 text-foreground shadow-[var(--card-shadow)]">
      <h2 className="flex items-center justify-between border-b border-border pb-3 text-sm font-bold">
        <span>{t.itService.timelineTitle}</span>
        {request && (
          <span className="rounded bg-primary/10 px-2 py-0.5 font-mono text-xs font-semibold text-primary">
            {request.legacyId || request.id.slice(0, 8)}
          </span>
        )}
      </h2>

      {request ? (
        <div className="mt-4 flex flex-1 flex-col">
          <div className="mb-6 space-y-2 rounded-lg border border-border bg-surface-subtle p-3 text-xs">
            <p>
              <strong className="text-foreground">{t.itService.timelineRequester}:</strong>{' '}
              <span className="text-muted">
                {request.employee?.name} ({request.employee?.department})
              </span>
            </p>
            <p>
              <strong className="text-foreground">{t.itService.timelineType}:</strong>{' '}
              <span className="text-muted">{getTypeText(request.requestType)}</span>
            </p>
            <p>
              <strong className="text-foreground">{t.itService.timelineOperator}:</strong>{' '}
              <span className="text-muted">
                {request.assignedOperator?.name || t.itService.unassigned}
              </span>
            </p>
            <p>
              <strong className="text-foreground">{t.itService.timelineAsset}:</strong>{' '}
              <span className="text-muted">
                {request.asset
                  ? `${request.asset.model} [${request.asset.legacyId || t.itService.noAssetCode}]`
                  : t.itService.unattached}
              </span>
            </p>
          </div>

          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t.itService.fsmProgress}
          </h3>

          <div className="relative flex-1 space-y-6 pl-6 before:absolute before:bottom-2 before:left-2 before:top-2 before:w-0.5 before:bg-border">
            {request.history && request.history.length > 0 ? (
              request.history.map((h, i) => (
                <div key={h.id || i} className="relative text-xs">
                  <div className="shadow-xs absolute -left-[21px] top-1 h-3 w-3 rounded-full border-2 border-surface bg-primary" />
                  <div className="flex items-baseline justify-between">
                    <span className="font-bold text-foreground">
                      {getStatusLabel(h.toStatus as ServiceRequestStatus)}
                    </span>
                    <span className="font-mono text-sm text-muted-foreground">
                      {new Date(h.occurredAt).toLocaleString(dateLocaleStr, {
                        timeZone: 'Asia/Ho_Chi_Minh',
                      })}
                    </span>
                  </div>
                  <p className="mt-0.5 text-sm text-muted">
                    {t.itService.performedBy}:{' '}
                    <strong className="text-foreground">
                      {h.actor?.name || 'System / Operator'}
                    </strong>
                  </p>
                  {h.note && (
                    <p className="mt-1.5 rounded-lg border border-border bg-surface-subtle p-2 text-sm italic text-muted">
                      &ldquo;{h.note}&rdquo;
                    </p>
                  )}
                </div>
              ))
            ) : (
              <p className="py-4 text-xs text-muted">{t.itService.noHistory}</p>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center py-16 text-center text-muted">
          <Layers className="mb-2 h-8 w-8 text-muted-foreground opacity-40" />
          <p className="text-xs">{t.itService.selectRequestPrompt}</p>
        </div>
      )}
    </div>
  );
}

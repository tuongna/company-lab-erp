'use client';

import React from 'react';
import { Layers } from 'lucide-react';
import { ServiceRequestItem } from '@companylab/contracts';

interface RequestTimelineProps {
  request: ServiceRequestItem | null;
  loading?: boolean;
}

export function RequestTimeline({ request, loading }: RequestTimelineProps) {
  if (loading) {
    return (
      <div className="bg-surface rounded-xl border border-border shadow-[var(--card-shadow)] p-6 flex flex-col animate-pulse">
        <div className="h-5 bg-surface-subtle rounded w-1/2 mb-4" />
        <div className="h-24 bg-surface-subtle rounded mb-6" />
        <div className="space-y-4">
          <div className="h-10 bg-surface-subtle rounded" />
          <div className="h-10 bg-surface-subtle rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-xl border border-border shadow-[var(--card-shadow)] p-6 flex flex-col text-foreground">
      <h2 className="text-sm font-bold border-b border-border pb-3 flex items-center justify-between">
        <span>Lịch sử chuyển trạng thái (Audit Trail)</span>
        {request && (
          <span className="font-mono text-xs text-primary bg-primary/10 px-2 py-0.5 rounded font-semibold">
            {request.legacyId || request.id.slice(0, 8)}
          </span>
        )}
      </h2>

      {request ? (
        <div className="mt-4 flex-1 flex flex-col">
          <div className="text-xs space-y-2 mb-6 bg-surface-subtle p-3 rounded-lg border border-border">
            <p>
              <strong className="text-foreground">Người yêu cầu:</strong>{' '}
              <span className="text-muted">
                {request.employee?.name} ({request.employee?.department})
              </span>
            </p>
            <p>
              <strong className="text-foreground">Loại:</strong>{' '}
              <span className="text-muted">{request.requestType}</span>
            </p>
            <p>
              <strong className="text-foreground">Người phụ trách IT:</strong>{' '}
              <span className="text-muted">
                {request.assignedOperator?.name || 'Chưa phân công'}
              </span>
            </p>
            <p>
              <strong className="text-foreground">Thiết bị:</strong>{' '}
              <span className="text-muted">
                {request.asset
                  ? `${request.asset.model} [${request.asset.legacyId || 'No Code'}]`
                  : 'Chưa gắn'}
              </span>
            </p>
          </div>

          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Tiến trình FSM (State Transitions)
          </h3>

          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border flex-1">
            {request.history && request.history.length > 0 ? (
              request.history.map((h, i) => (
                <div key={h.id || i} className="relative text-xs">
                  <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full border-2 border-surface bg-primary shadow-xs" />
                  <div className="flex items-baseline justify-between">
                    <span className="font-bold text-foreground">{h.toStatus}</span>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {new Date(h.occurredAt).toLocaleString('vi-VN', {
                        timeZone: 'Asia/Ho_Chi_Minh',
                      })}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted mt-0.5">
                    Thực hiện bởi:{' '}
                    <strong className="text-foreground">
                      {h.actor?.name || 'System / Operator'}
                    </strong>
                  </p>
                  {h.note && (
                    <p className="mt-1.5 p-2 bg-surface-subtle rounded-lg border border-border text-[11px] text-muted italic">
                      &ldquo;{h.note}&rdquo;
                    </p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-xs text-muted py-4">Chưa có lịch sử sự kiện.</p>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-16 text-muted">
          <Layers className="w-8 h-8 text-muted-foreground opacity-40 mb-2" />
          <p className="text-xs">Chọn một yêu cầu bên bảng để xem toàn bộ lịch sử State Machine</p>
        </div>
      )}
    </div>
  );
}

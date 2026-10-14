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
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col animate-pulse">
        <div className="h-5 bg-slate-200 rounded w-1/2 mb-4" />
        <div className="h-24 bg-slate-100 rounded mb-6" />
        <div className="space-y-4">
          <div className="h-10 bg-slate-100 rounded" />
          <div className="h-10 bg-slate-100 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col">
      <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
        <span>Lịch sử chuyển trạng thái (Audit Trail)</span>
        {request && (
          <span className="font-mono text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
            {request.legacyId || request.id.slice(0, 8)}
          </span>
        )}
      </h2>

      {request ? (
        <div className="mt-4 flex-1 flex flex-col">
          <div className="text-xs space-y-2 mb-6 bg-slate-50 p-3 rounded-lg border border-slate-100">
            <p>
              <strong>Người yêu cầu:</strong> {request.employee?.name} (
              {request.employee?.department})
            </p>
            <p>
              <strong>Loại:</strong> {request.requestType}
            </p>
            <p>
              <strong>Người phụ trách IT:</strong>{' '}
              {request.assignedOperator?.name || 'Chưa phân công'}
            </p>
            <p>
              <strong>Thiết bị:</strong>{' '}
              {request.asset
                ? `${request.asset.model} [${request.asset.legacyId || 'No Code'}]`
                : 'Chưa gắn'}
            </p>
          </div>

          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
            Tiến trình FSM (State Transitions)
          </h3>

          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 flex-1">
            {request.history && request.history.length > 0 ? (
              request.history.map((h, i) => (
                <div key={h.id || i} className="relative text-xs">
                  <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full border-2 border-white bg-indigo-600 shadow-sm" />
                  <div className="flex items-baseline justify-between">
                    <span className="font-bold text-slate-800">{h.toStatus}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(h.occurredAt).toLocaleString('vi-VN', {
                        timeZone: 'Asia/Ho_Chi_Minh',
                      })}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Thực hiện bởi: <strong>{h.actor?.name || 'System / Operator'}</strong>
                  </p>
                  {h.note && (
                    <p className="mt-1.5 p-2 bg-slate-100/70 rounded text-[11px] text-slate-600 italic">
                      "{h.note}"
                    </p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-4">Chưa có lịch sử sự kiện.</p>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-16 text-slate-400">
          <Layers className="w-8 h-8 text-slate-300 mb-2" />
          <p className="text-xs">Chọn một yêu cầu bên bảng để xem toàn bộ lịch sử State Machine</p>
        </div>
      )}
    </div>
  );
}

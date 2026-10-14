'use client';

import React from 'react';
import { CheckCircle2, Clock, RefreshCw } from 'lucide-react';
import { DashboardStatsResponse } from '@companylab/contracts';

interface MetricCardsProps {
  stats: DashboardStatsResponse | null;
  loading?: boolean;
}

export function MetricCards({ stats, loading }: MetricCardsProps) {
  if (loading && !stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-slate-200/70 rounded-xl" />
        ))}
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* 1. Total requests */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
          Tổng số yêu cầu
        </span>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-2xl font-bold text-slate-900">{stats.requests.total_requests}</span>
          <span className="text-xs text-slate-400">Từ Sheets/XLSX</span>
        </div>
        <div className="mt-3 text-xs text-slate-500 flex gap-2">
          <span>
            Cấp: <strong>{stats.requests.type_allocation}</strong>
          </span>
          <span>•</span>
          <span>
            Thu: <strong>{stats.requests.type_return}</strong>
          </span>
          <span>•</span>
          <span>
            Sửa: <strong>{stats.requests.type_repair}</strong>
          </span>
        </div>
      </div>

      {/* 2. Pending approval */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <span className="text-xs font-medium text-amber-600 uppercase tracking-wider">
          Chờ phê duyệt
        </span>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-2xl font-bold text-amber-600">
            {stats.requests.pending_approval}
          </span>
          <Clock className="w-5 h-5 text-amber-500" />
        </div>
        <p className="mt-3 text-xs text-slate-500">Đơn chờ Manager xác nhận</p>
      </div>

      {/* 3. In progress */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <span className="text-xs font-medium text-blue-600 uppercase tracking-wider">
          Đang xử lý (IT)
        </span>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-2xl font-bold text-blue-600">{stats.requests.in_progress}</span>
          <RefreshCw className="w-5 h-5 text-blue-500" />
        </div>
        <p className="mt-3 text-xs text-slate-500">Operator đang chuẩn bị máy</p>
      </div>

      {/* 4. Total assets */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <span className="text-xs font-medium text-emerald-600 uppercase tracking-wider">
          Kho Laptop & Thiết bị
        </span>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-2xl font-bold text-emerald-700">{stats.assets.total_assets}</span>
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
        </div>
        <div className="mt-3 text-xs text-slate-500 flex gap-2">
          <span>
            Sẵn sàng: <strong className="text-emerald-600">{stats.assets.available_assets}</strong>
          </span>
          <span>•</span>
          <span>
            Đang cấp: <strong className="text-slate-800">{stats.assets.assigned_assets}</strong>
          </span>
        </div>
      </div>
    </div>
  );
}

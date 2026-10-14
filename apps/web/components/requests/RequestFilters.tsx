'use client';

import React from 'react';
import { ServiceRequestStatus, ServiceRequestType } from '@companylab/contracts';

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
  return (
    <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          className="bg-white border border-slate-200 text-xs rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="">Tất cả trạng thái</option>
          <option value={ServiceRequestStatus.PENDING_APPROVAL}>
            Chờ duyệt (Pending approval)
          </option>
          <option value={ServiceRequestStatus.APPROVED}>Đã duyệt (Approved)</option>
          <option value={ServiceRequestStatus.IN_PROGRESS}>Đang xử lý (In progress)</option>
          <option value={ServiceRequestStatus.COMPLETED}>Hoàn thành (Completed)</option>
          <option value={ServiceRequestStatus.REJECTED}>Từ chối (Rejected)</option>
          <option value={ServiceRequestStatus.CANCELLED}>Hủy (Cancelled)</option>
        </select>

        <select
          value={type}
          onChange={(e) => onTypeChange(e.target.value)}
          className="bg-white border border-slate-200 text-xs rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="">Tất cả loại yêu cầu</option>
          <option value={ServiceRequestType.ALLOCATION}>Cấp phát laptop</option>
          <option value={ServiceRequestType.RETURN}>Thu hồi laptop</option>
          <option value={ServiceRequestType.REPAIR}>Sửa chữa laptop</option>
        </select>
      </div>

      <span className="text-xs text-slate-500">
        Hiển thị trang <strong>{page}</strong> / {totalPages || 1}
      </span>
    </div>
  );
}

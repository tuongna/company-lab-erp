'use client';

import React from 'react';
import { ChevronRight } from 'lucide-react';
import { ServiceRequestItem, ServiceRequestType } from '@companylab/contracts';
import { RequestStatusBadge } from './RequestStatusBadge';

interface RequestTableProps {
  items: ServiceRequestItem[];
  selectedId: string | null;
  loading: boolean;
  page: number;
  totalPages: number;
  onSelect: (item: ServiceRequestItem) => void;
  onPageChange: (newPage: number) => void;
}

export function RequestTable({
  items,
  selectedId,
  loading,
  page,
  totalPages,
  onSelect,
  onPageChange,
}: RequestTableProps) {
  const getTypeText = (type: ServiceRequestType) => {
    switch (type) {
      case ServiceRequestType.ALLOCATION:
        return 'Cấp phát';
      case ServiceRequestType.RETURN:
        return 'Thu hồi';
      case ServiceRequestType.REPAIR:
        return 'Sửa chữa';
      default:
        return type;
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left text-xs">
          <thead className="bg-surface-subtle text-muted uppercase font-semibold text-[10px] border-b border-border">
            <tr>
              <th className="px-4 py-3">Mã đơn</th>
              <th className="px-4 py-3">Loại yêu cầu</th>
              <th className="px-4 py-3">Nhân viên</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3">Thiết bị</th>
              <th className="px-4 py-3 text-right">Chi tiết</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading && items.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-10 text-muted">
                  Đang tải danh sách yêu cầu...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-10 text-muted">
                  Không có yêu cầu nào phù hợp bộ lọc.
                </td>
              </tr>
            ) : (
              items.map((r) => (
                <tr
                  key={r.id}
                  onClick={() => onSelect(r)}
                  className={`hover:bg-surface-subtle cursor-pointer transition ${
                    selectedId === r.id ? 'bg-primary/10' : ''
                  }`}
                >
                  <td className="px-4 py-3 font-mono font-medium text-foreground">
                    {r.legacyId || r.id.slice(0, 8)}
                  </td>
                  <td className="px-4 py-3 font-medium text-foreground">
                    {getTypeText(r.requestType)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground">{r.employee?.name || '—'}</div>
                    <div className="text-[10px] text-muted">{r.employee?.department}</div>
                  </td>
                  <td className="px-4 py-3">
                    <RequestStatusBadge status={r.status} />
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {r.asset ? `${r.asset.model} (${r.asset.legacyId || 'No Code'})` : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <ChevronRight className="w-4 h-4 text-muted inline" />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="p-3 border-t border-border bg-surface-subtle flex items-center justify-between text-xs">
        <button
          disabled={page <= 1 || loading}
          onClick={() => onPageChange(Math.max(page - 1, 1))}
          className="px-3 py-1 bg-surface border border-border rounded-lg disabled:opacity-50 text-foreground hover:bg-surface-subtle transition shadow-xs"
        >
          Trang trước
        </button>
        <span className="text-muted">
          Trang <strong className="text-foreground">{page}</strong> / {totalPages || 1}
        </span>
        <button
          disabled={page >= totalPages || loading}
          onClick={() => onPageChange(Math.min(page + 1, totalPages))}
          className="px-3 py-1 bg-surface border border-border rounded-lg disabled:opacity-50 text-foreground hover:bg-surface-subtle transition shadow-xs"
        >
          Trang sau
        </button>
      </div>
    </div>
  );
}

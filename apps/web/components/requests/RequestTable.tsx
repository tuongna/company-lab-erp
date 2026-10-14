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
          <thead className="bg-slate-50 text-slate-500 uppercase font-medium border-b border-slate-200">
            <tr>
              <th className="px-4 py-3">Mã đơn</th>
              <th className="px-4 py-3">Loại yêu cầu</th>
              <th className="px-4 py-3">Nhân viên</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3">Thiết bị</th>
              <th className="px-4 py-3 text-right">Chi tiết</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && items.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-10 text-slate-400">
                  Đang tải danh sách yêu cầu...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-10 text-slate-400">
                  Không có yêu cầu nào phù hợp bộ lọc.
                </td>
              </tr>
            ) : (
              items.map((r) => (
                <tr
                  key={r.id}
                  onClick={() => onSelect(r)}
                  className={`hover:bg-slate-50/80 cursor-pointer transition ${
                    selectedId === r.id ? 'bg-indigo-50/50' : ''
                  }`}
                >
                  <td className="px-4 py-3 font-mono font-medium text-slate-900">
                    {r.legacyId || r.id.slice(0, 8)}
                  </td>
                  <td className="px-4 py-3 font-medium">{getTypeText(r.requestType)}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-800">{r.employee?.name || '—'}</div>
                    <div className="text-[10px] text-slate-400">{r.employee?.department}</div>
                  </td>
                  <td className="px-4 py-3">
                    <RequestStatusBadge status={r.status} />
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {r.asset ? `${r.asset.model} (${r.asset.legacyId || 'No Code'})` : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <ChevronRight className="w-4 h-4 text-slate-400 inline" />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
        <button
          disabled={page <= 1 || loading}
          onClick={() => onPageChange(Math.max(page - 1, 1))}
          className="px-3 py-1 bg-white border border-slate-200 rounded disabled:opacity-50 text-slate-700 hover:bg-slate-100 transition"
        >
          Trang trước
        </button>
        <span className="text-slate-500">
          Trang {page} / {totalPages || 1}
        </span>
        <button
          disabled={page >= totalPages || loading}
          onClick={() => onPageChange(Math.min(page + 1, totalPages))}
          className="px-3 py-1 bg-white border border-slate-200 rounded disabled:opacity-50 text-slate-700 hover:bg-slate-100 transition"
        >
          Trang sau
        </button>
      </div>
    </div>
  );
}

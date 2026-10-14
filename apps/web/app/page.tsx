'use client';

import React, { useEffect, useState } from 'react';
import {
  Laptop,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileSpreadsheet,
  RefreshCw,
  Search,
  ChevronRight,
  ShieldAlert,
  ArrowRight,
  Layers,
} from 'lucide-react';

interface DashboardStats {
  requests: {
    total_requests: string;
    pending_approval: string;
    in_progress: string;
    completed: string;
    rejected: string;
    cancelled: string;
    type_allocation: string;
    type_return: string;
    type_repair: string;
  };
  assets: {
    total_assets: string;
    available_assets: string;
    assigned_assets: string;
  };
  mode: string;
  legacySource: string;
}

interface ServiceRequestItem {
  id: string;
  legacyId: string;
  requestType: string;
  status: string;
  createdAt: string;
  employee?: {
    name: string;
    department: string;
    legacyId: string;
  };
  assignedOperator?: {
    name: string;
  };
  asset?: {
    model: string;
    legacyId: string;
  };
  history?: Array<{
    id: string;
    toStatus: string;
    fromStatus: string;
    occurredAt: string;
    note: string;
    actor?: {
      name: string;
      role: string;
    };
  }>;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [requests, setRequests] = useState<ServiceRequestItem[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequestItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchData = async () => {
    setLoading(true);
    try {
      const statsRes = await fetch('http://localhost:3001/api/requests/dashboard');
      if (statsRes.ok) {
        setStats(await statsRes.json());
      }

      const query = new URLSearchParams({
        page: page.toString(),
        limit: '15',
        ...(statusFilter ? { status: statusFilter } : {}),
        ...(typeFilter ? { type: typeFilter } : {}),
      });

      const listRes = await fetch(`http://localhost:3001/api/requests?${query.toString()}`);
      if (listRes.ok) {
        const data = await listRes.json();
        setRequests(data.items);
        setTotalPages(data.totalPages);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, statusFilter, typeFilter]);

  const fetchDetail = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:3001/api/requests/${id}`);
      if (res.ok) {
        setSelectedRequest(await res.json());
      }
    } catch (err) {
      console.error('Detail fetch error:', err);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'IN_PROGRESS':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'PENDING_APPROVAL':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'REJECTED':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'CANCELLED':
        return 'bg-slate-100 text-slate-600 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12">
      {/* Top Banner: Read-only notice */}
      <div className="bg-amber-500/10 border-b border-amber-500/20 px-6 py-2.5 text-xs text-amber-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>
            <strong>GIAI ĐOẠN A (SHADOW RUN — CHỈ ĐỌC):</strong> Hệ thống hiện đang chạy song song và lấy dữ liệu đồng bộ từ Google Sheets / XLSX. Mọi thao tác ghi mới hoặc chuyển trạng thái được tạm khóa trên Web để bảo đảm tính toàn vẹn (Single Source of Truth).
          </span>
        </div>
        <span className="font-mono bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-semibold">
          MODE: READ-ONLY
        </span>
      </div>

      {/* Main Header */}
      <header className="bg-white border-b border-slate-200 px-8 py-5">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-indigo-600 text-white rounded-lg shadow-sm">
                <Laptop className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                CLT-ERP — IT Asset Operations
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Hệ thống quản lý quy trình cấp phát & luân chuyển tài sản CNTT — Bám sát kiến trúc ERP
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-md transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Làm mới dữ liệu
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-8 mt-6 space-y-6">
        {/* Metric Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Tổng số yêu cầu</span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl font-bold text-slate-900">{stats.requests.total_requests}</span>
                <span className="text-xs text-slate-400">Từ Sheets/XLSX</span>
              </div>
              <div className="mt-3 text-xs text-slate-500 flex gap-2">
                <span>Cấp: <strong>{stats.requests.type_allocation}</strong></span>
                <span>•</span>
                <span>Thu: <strong>{stats.requests.type_return}</strong></span>
                <span>•</span>
                <span>Sửa: <strong>{stats.requests.type_repair}</strong></span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-medium text-amber-600 uppercase tracking-wider">Chờ phê duyệt</span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl font-bold text-amber-600">{stats.requests.pending_approval}</span>
                <Clock className="w-5 h-5 text-amber-500" />
              </div>
              <p className="mt-3 text-xs text-slate-500">Đơn chờ Manager xác nhận</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-medium text-blue-600 uppercase tracking-wider">Đang xử lý (IT)</span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl font-bold text-blue-600">{stats.requests.in_progress}</span>
                <RefreshCw className="w-5 h-5 text-blue-500" />
              </div>
              <p className="mt-3 text-xs text-slate-500">Operator đang chuẩn bị máy</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-medium text-emerald-600 uppercase tracking-wider">Kho Laptop & Thiết bị</span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl font-bold text-emerald-700">{stats.assets.total_assets}</span>
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              </div>
              <div className="mt-3 text-xs text-slate-500 flex gap-2">
                <span>Sẵn sàng: <strong className="text-emerald-600">{stats.assets.available_assets}</strong></span>
                <span>•</span>
                <span>Đang cấp: <strong className="text-slate-800">{stats.assets.assigned_assets}</strong></span>
              </div>
            </div>
          </div>
        )}

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Table */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            {/* Table Filters */}
            <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                  className="bg-white border border-slate-200 text-xs rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">Tất cả trạng thái</option>
                  <option value="PENDING_APPROVAL">Pending approval</option>
                  <option value="IN_PROGRESS">In progress</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>

                <select
                  value={typeFilter}
                  onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
                  className="bg-white border border-slate-200 text-xs rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">Tất cả loại yêu cầu</option>
                  <option value="ALLOCATION">Cấp phát laptop</option>
                  <option value="RETURN">Thu hồi laptop</option>
                  <option value="REPAIR">Sửa chữa laptop</option>
                </select>
              </div>

              <span className="text-xs text-slate-500">
                Hiển thị trang <strong>{page}</strong> / {totalPages}
              </span>
            </div>

            {/* Request Rows */}
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
                  {loading && requests.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-10 text-slate-400">
                        Đang tải danh sách từ PostgreSQL...
                      </td>
                    </tr>
                  ) : requests.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-10 text-slate-400">
                        Không có yêu cầu nào phù hợp bộ lọc.
                      </td>
                    </tr>
                  ) : (
                    requests.map((r) => (
                      <tr
                        key={r.id}
                        onClick={() => fetchDetail(r.id)}
                        className={`hover:bg-slate-50/80 cursor-pointer transition ${
                          selectedRequest?.id === r.id ? 'bg-indigo-50/50' : ''
                        }`}
                      >
                        <td className="px-4 py-3 font-mono font-medium text-slate-900">
                          {r.legacyId || r.id.slice(0, 8)}
                        </td>
                        <td className="px-4 py-3 font-medium">
                          {r.requestType === 'ALLOCATION' && 'Cấp phát'}
                          {r.requestType === 'RETURN' && 'Thu hồi'}
                          {r.requestType === 'REPAIR' && 'Sửa chữa'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-800">{r.employee?.name || '—'}</div>
                          <div className="text-[10px] text-slate-400">{r.employee?.department}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusBadge(
                              r.status,
                            )}`}
                          >
                            {r.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {r.asset ? `${r.asset.model} (${r.asset.legacyId})` : '—'}
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
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                className="px-3 py-1 bg-white border border-slate-200 rounded disabled:opacity-50 text-slate-700 hover:bg-slate-100"
              >
                Trang trước
              </button>
              <span className="text-slate-500">Trang {page} / {totalPages}</span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                className="px-3 py-1 bg-white border border-slate-200 rounded disabled:opacity-50 text-slate-700 hover:bg-slate-100"
              >
                Trang sau
              </button>
            </div>
          </div>

          {/* Right Col: Timeline & Detail */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
              <span>Lịch sử chuyển trạng thái (Audit Trail)</span>
              {selectedRequest && (
                <span className="font-mono text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                  {selectedRequest.legacyId}
                </span>
              )}
            </h2>

            {selectedRequest ? (
              <div className="mt-4 flex-1 flex flex-col">
                <div className="text-xs space-y-2 mb-6 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <p><strong>Người yêu cầu:</strong> {selectedRequest.employee?.name} ({selectedRequest.employee?.department})</p>
                  <p><strong>Loại:</strong> {selectedRequest.requestType}</p>
                  <p><strong>Người phụ trách IT:</strong> {selectedRequest.assignedOperator?.name || 'Chưa phân công'}</p>
                  <p><strong>Thiết bị:</strong> {selectedRequest.asset ? `${selectedRequest.asset.model} [${selectedRequest.asset.legacyId}]` : 'Chưa gắn'}</p>
                </div>

                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
                  Tiến trình FSM (State Transitions)
                </h3>

                <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 flex-1">
                  {selectedRequest.history && selectedRequest.history.length > 0 ? (
                    selectedRequest.history.map((h, i) => (
                      <div key={h.id || i} className="relative text-xs">
                        <div className="absolute -left-[22px] top-1 w-3 h-3 rounded-full border-2 border-white bg-indigo-600 shadow-sm" />
                        <div className="flex items-baseline justify-between">
                          <span className="font-bold text-slate-800">
                            {h.toStatus}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {new Date(h.occurredAt).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}
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
        </div>
      </div>
    </div>
  );
}

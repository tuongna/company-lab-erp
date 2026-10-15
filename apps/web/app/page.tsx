'use client';

import React, { useState } from 'react';
import { Laptop, RefreshCw, ShieldAlert } from 'lucide-react';
import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { ServiceRequestItem } from '@companylab/contracts';
import { fetchDashboardStats, fetchRequests, fetchRequestDetail } from '@/lib/api-client';
import { MetricCards } from '@/components/dashboard/MetricCards';
import { RequestFilters } from '@/components/requests/RequestFilters';
import { RequestTable } from '@/components/requests/RequestTable';
import { RequestTimeline } from '@/components/requests/RequestTimeline';

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);

  // 1. Fetch Dashboard Metrics
  const statsQuery = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: fetchDashboardStats,
  });

  // 2. Fetch Paginated Requests List (with caching and previous data preservation)
  const requestsQuery = useQuery({
    queryKey: ['requests', { page, status: statusFilter, type: typeFilter }],
    queryFn: () =>
      fetchRequests({
        page,
        limit: 15,
        status: statusFilter || undefined,
        type: typeFilter || undefined,
      }),
    placeholderData: keepPreviousData,
  });

  // 3. Fetch Selected Request Detail (with history timeline)
  const detailQuery = useQuery({
    queryKey: ['request-detail', selectedId],
    queryFn: () => fetchRequestDetail(selectedId!),
    enabled: Boolean(selectedId),
  });

  const handleRefresh = async () => {
    await queryClient.invalidateQueries();
  };

  const handleStatusChange = (newStatus: string) => {
    setStatusFilter(newStatus);
    setPage(1);
  };

  const handleTypeChange = (newType: string) => {
    setTypeFilter(newType);
    setPage(1);
  };

  const handleSelectRequest = (item: ServiceRequestItem) => {
    setSelectedId(item.id);
  };

  const requestsData = requestsQuery.data?.items || [];
  const totalPages = requestsQuery.data?.totalPages || 1;
  const isRefreshing = statsQuery.isFetching || requestsQuery.isFetching;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12">
      {/* Top Banner: Read-only notice (ADR-0001 Shadow Phase) */}
      <div className="bg-amber-500/10 border-b border-amber-500/20 px-6 py-2.5 text-xs text-amber-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>
            <strong>GIAI ĐOẠN A (SHADOW RUN — CHỈ ĐỌC):</strong> Hệ thống hiện đang chạy song song
            và lấy dữ liệu đồng bộ từ Google Sheets trực tiếp qua Service Account API. Mọi thao tác
            ghi mới hoặc chuyển trạng thái được tạm khóa trên Web để bảo đảm tính toàn vẹn (Single
            Source of Truth).
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
                CompanyLab ERP — IT Asset Operations
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Hệ thống quản lý quy trình cấp phát & luân chuyển tài sản CNTT — Bám sát kiến trúc ERP
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-md transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              Làm mới dữ liệu
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-8 mt-6 space-y-6">
        <div className="rounded-lg border bg-white p-4 text-sm" aria-live="polite">
          {statsQuery.isError ? (
            <p role="alert">Cannot load data. Check the API connection and try Refresh.</p>
          ) : statsQuery.data ? (
            <>
              <p className="break-all">Source: {statsQuery.data.legacySource}</p>
              <p>
                Latest sync: {statsQuery.data.lastSync?.status ?? 'NOT RUN'}
                {' · '}
                {statsQuery.data.lastSync?.finished_at
                  ? new Date(statsQuery.data.lastSync.finished_at).toLocaleString('vi-VN', {
                      timeZone: 'Asia/Ho_Chi_Minh',
                    })
                  : 'No completed sync yet'}
              </p>
              {statsQuery.data.lastSync && statsQuery.data.lastSync.status !== 'COMPLETED' && (
                <p role="alert" className="text-amber-800">
                  Sync has not completed successfully. Metrics show the last accepted snapshot.
                </p>
              )}
              <p className="text-xs text-slate-500">
                Refresh reloads imported data. Google Sheets is updated by the separate sync job.
              </p>
            </>
          ) : (
            <p>Loading sync status...</p>
          )}
        </div>
        {/* Metric Cards */}
        <MetricCards stats={statsQuery.data || null} loading={statsQuery.isLoading} />

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Table & Filter */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <RequestFilters
              status={statusFilter}
              type={typeFilter}
              page={page}
              totalPages={totalPages}
              onStatusChange={handleStatusChange}
              onTypeChange={handleTypeChange}
            />

            <RequestTable
              items={requestsData}
              selectedId={selectedId}
              loading={requestsQuery.isLoading}
              page={page}
              totalPages={totalPages}
              onSelect={handleSelectRequest}
              onPageChange={setPage}
            />
          </div>

          {/* Right Col: Timeline & Detail */}
          <RequestTimeline request={detailQuery.data || null} loading={detailQuery.isLoading} />
        </div>
      </div>
    </div>
  );
}

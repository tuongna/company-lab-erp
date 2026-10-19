import React, { useState } from 'react';
import { Download, RefreshCw, ShieldAlert } from 'lucide-react';
import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { ServiceRequestItem } from '@companylab/contracts';
import { fetchDashboardStats, fetchRequests, fetchRequestDetail } from '@/lib/api-client';
import { MetricCards } from '@/components/dashboard/MetricCards';
import { RequestFilters } from '@/components/requests/RequestFilters';
import { RequestTable } from '@/components/requests/RequestTable';
import { RequestTimeline } from '@/components/requests/RequestTimeline';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { PageHeader } from '@/components/layout/PageHeader';

export function ITServiceView({ toast }: { toast: (s: string) => void }) {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);

  const statsQuery = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: fetchDashboardStats,
  });

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

  const detailQuery = useQuery({
    queryKey: ['request-detail', selectedId],
    queryFn: () => fetchRequestDetail(selectedId!),
    enabled: Boolean(selectedId),
  });

  const handleRefresh = async () => {
    await queryClient.invalidateQueries();
    toast('Dữ liệu đã được cập nhật từ database');
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
    <div className="space-y-4">
      {/* Read-only notice (ADR-0001 Shadow Phase) */}
      <div className="bg-amber-500/10 border border-amber-500/20 px-4 py-2.5 rounded-xl text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span>
            <strong>GIAI ĐOẠN A (SHADOW RUN — CHỈ ĐỌC):</strong> Hệ thống đang chạy song song và lấy
            dữ liệu đồng bộ từ Google Sheets qua Service Account API.
          </span>
        </div>
        <span className="font-mono bg-amber-200/50 dark:bg-amber-900/40 text-amber-900 dark:text-amber-200 px-2 py-0.5 rounded font-semibold text-[11px]">
          MODE: READ-ONLY
        </span>
      </div>

      <PageHeader
        title="IT Asset Operations"
        subtitle="Quản lý quy trình cấp phát, đổi trả & sửa chữa Laptop / Thiết bị CNTT"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              Làm mới dữ liệu
            </Button>
            <Button onClick={() => toast('Báo cáo tài sản IT đã được tải')}>
              <Download size={14} /> Xuất báo cáo
            </Button>
          </div>
        }
      />

      {/* Sync Status Banner */}
      <Card className="p-3.5 text-xs text-foreground flex items-center justify-between">
        <div>
          <span className="font-semibold block">
            Nguồn đồng bộ: {statsQuery.data?.legacySource || 'Google Sheets Service Account'}
          </span>
          <p className="text-muted text-[11px]">
            Lần hoàn thành gần nhất:{' '}
            {statsQuery.data?.lastSync?.finished_at
              ? new Date(statsQuery.data.lastSync.finished_at).toLocaleString('vi-VN', {
                  timeZone: 'Asia/Ho_Chi_Minh',
                })
              : 'Chưa có lượt chạy'}
          </p>
        </div>
        <Badge tone={statsQuery.data?.lastSync?.status === 'COMPLETED' ? 'success' : 'warning'}>
          Sync: {statsQuery.data?.lastSync?.status ?? 'READY'}
        </Badge>
      </Card>

      {/* Metric Cards */}
      <MetricCards stats={statsQuery.data || null} loading={statsQuery.isLoading} />

      {/* Request Table & Timeline layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-surface rounded-xl border border-border shadow-xs overflow-hidden flex flex-col">
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

        <RequestTimeline request={detailQuery.data || null} loading={detailQuery.isLoading} />
      </div>
    </div>
  );
}

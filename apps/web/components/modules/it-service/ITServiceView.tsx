import React, { useState } from 'react';
import { Download, RefreshCw, ShieldAlert } from 'lucide-react';
import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { ServiceRequestItem } from '@companylab/contracts';
import {
  fetchDashboardStats,
  fetchRequests,
  fetchRequestDetail,
  queryKeys,
} from '@/lib/api-client';
import { MetricCards } from '@/components/dashboard/MetricCards';
import { RequestFilters } from '@/components/requests/RequestFilters';
import { RequestTable } from '@/components/requests/RequestTable';
import { RequestTimeline } from '@/components/requests/RequestTimeline';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { PageHeader } from '@/components/layout/PageHeader';
import { useTranslation } from '@/lib/i18n/context';

export function ITServiceView({ toast }: { toast: (s: string) => void }) {
  const { t, locale } = useTranslation();
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);

  const statsQuery = useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: fetchDashboardStats,
  });

  const requestsQuery = useQuery({
    queryKey: queryKeys.requests.list({
      page,
      status: statusFilter || undefined,
      type: typeFilter || undefined,
    }),
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
    queryKey: selectedId ? queryKeys.requests.detail(selectedId) : ['request-detail-idle'],
    queryFn: () => fetchRequestDetail(selectedId!),
    enabled: Boolean(selectedId),
  });

  const handleRefresh = async () => {
    await queryClient.invalidateQueries();
    toast(t.common.refreshData);
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

  const dateLocaleStr = locale === 'ko' ? 'ko-KR' : locale === 'en' ? 'en-US' : 'vi-VN';

  return (
    <div className="space-y-4">
      {/* Read-only notice (ADR-0001 Shadow Phase) */}
      <div className="flex items-center justify-between rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-2.5 text-xs text-amber-800 dark:text-amber-300">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 shrink-0 text-amber-800 dark:text-amber-300" />
          <span>
            <strong>{t.common.readOnlyBadge}:</strong> {t.common.readOnlyNotice}
          </span>
        </div>
        <span className="rounded bg-amber-200/50 px-2 py-0.5 font-mono text-sm font-semibold text-amber-900 dark:bg-amber-900/40 dark:text-amber-200">
          READ-ONLY
        </span>
      </div>

      <PageHeader
        title={t.itService.title}
        subtitle={t.itService.subtitle}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              {t.common.refreshData}
            </Button>
            <Button onClick={() => toast(t.common.exportReport)}>
              <Download size={14} /> {t.common.exportReport}
            </Button>
          </div>
        }
      />

      {/* Sync Status Banner */}
      <Card className="flex items-center justify-between p-3.5 text-xs text-foreground">
        <div>
          <span className="block font-semibold">
            {t.itService.syncSource}:{' '}
            {statsQuery.data?.legacySource || 'Google Sheets Service Account'}
          </span>
          <p className="text-sm text-muted">
            {t.common.lastSync}:{' '}
            {statsQuery.data?.lastSync?.finished_at
              ? new Date(statsQuery.data.lastSync.finished_at).toLocaleString(dateLocaleStr, {
                  timeZone: 'Asia/Ho_Chi_Minh',
                })
              : t.common.noData}
          </p>
        </div>
        <Badge tone={statsQuery.data?.lastSync?.status === 'COMPLETED' ? 'success' : 'warning'}>
          Sync: {statsQuery.data?.lastSync?.status ?? 'READY'}
        </Badge>
      </Card>

      {/* Metric Cards */}
      <MetricCards stats={statsQuery.data || null} loading={statsQuery.isLoading} />

      {/* Request Table & Timeline layout */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="shadow-xs flex flex-col rounded-xl border border-border bg-surface lg:col-span-2">
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

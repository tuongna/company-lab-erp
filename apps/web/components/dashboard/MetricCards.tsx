'use client';

import React from 'react';
import { CheckCircle2, Clock, RefreshCw } from 'lucide-react';
import { DashboardStatsResponse } from '@companylab/contracts';
import { Card } from '@/components/ui/card';
import { useTranslation } from '@/lib/i18n/context';

interface MetricCardsProps {
  stats: DashboardStatsResponse | null;
  loading?: boolean;
}

export function MetricCards({ stats, loading }: MetricCardsProps) {
  const { t } = useTranslation();

  if (loading && !stats) {
    return (
      <div className="grid animate-pulse grid-cols-1 gap-4 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} variant="subtle" className="h-28" />
        ))}
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
      {/* 1. Total requests */}
      <Card padding="lg">
        <span className="text-xs font-medium uppercase tracking-wider text-muted">
          {t.itService.totalRequests}
        </span>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-2xl font-bold text-foreground">
            {stats.requests.total_requests}
          </span>
          <span className="text-xs text-muted-foreground">{t.itService.fromGoogleSheets}</span>
        </div>
        <div className="mt-3 flex gap-2 text-xs text-muted">
          <span>
            {t.itService.typeAllocationShort}:{' '}
            <strong className="text-foreground">{stats.requests.type_allocation}</strong>
          </span>
          <span>•</span>
          <span>
            {t.itService.typeReturnShort}:{' '}
            <strong className="text-foreground">{stats.requests.type_return}</strong>
          </span>
          <span>•</span>
          <span>
            {t.itService.typeRepairShort}:{' '}
            <strong className="text-foreground">{stats.requests.type_repair}</strong>
          </span>
        </div>
      </Card>

      {/* 2. Pending approval */}
      <Card padding="lg">
        <span className="text-xs font-medium uppercase tracking-wider text-amber-800 dark:text-amber-300">
          {t.itService.pendingApproval}
        </span>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-2xl font-bold text-amber-700 dark:text-amber-400">
            {stats.requests.pending_approval}
          </span>
          <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
        </div>
        <p className="mt-3 text-xs text-muted">{t.itService.pendingApprovalDesc}</p>
      </Card>

      {/* 3. In progress */}
      <Card padding="lg">
        <span className="text-xs font-medium uppercase tracking-wider text-primary">
          {t.itService.inProgress}
        </span>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-2xl font-bold text-primary">{stats.requests.in_progress}</span>
          <RefreshCw className="h-5 w-5 text-primary" />
        </div>
        <p className="mt-3 text-xs text-muted">{t.itService.inProgressDesc}</p>
      </Card>

      {/* 4. Total assets */}
      <Card padding="lg">
        <span className="text-xs font-medium uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
          {t.itService.totalAssets}
        </span>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
            {stats.assets.total_assets}
          </span>
          <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div className="mt-3 flex gap-2 text-xs text-muted">
          <span>
            {t.itService.inventoryAvailable}:{' '}
            <strong className="text-emerald-700 dark:text-emerald-400">
              {stats.assets.available_assets}
            </strong>
          </span>
          <span>•</span>
          <span>
            {t.itService.inventoryAssigned}:{' '}
            <strong className="text-foreground">{stats.assets.assigned_assets}</strong>
          </span>
        </div>
      </Card>
    </div>
  );
}

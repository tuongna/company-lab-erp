import React from 'react';
import { Calendar, ChevronDown, Download, FileSpreadsheet, MoreHorizontal } from 'lucide-react';
import { Page, ProjectItem } from '@/lib/types/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Kpi } from '@/components/ui/kpi';
import { PageHeader } from '@/components/layout/PageHeader';
import { ProjectTable } from '@/components/modules/projects/ProjectTable';
import { useTranslation } from '@/lib/i18n/context';

export function OverviewView({
  onProject,
  setPage,
  toast,
}: {
  onProject: (p: ProjectItem) => void;
  setPage: (p: Page) => void;
  toast: (s: string) => void;
}) {
  const { t } = useTranslation();

  const approvals = [
    ['Timesheets', '6 awaiting approval', 'Anh Do + 5 others', '2 days', 'High'],
    ['Leave requests', '3 awaiting approval', 'Mai Vu + 2 others', '4 hours', 'Normal'],
    ['Resource requests', '2 awaiting approval', 'Project Delivery', '1 day', 'High'],
    ['Equipment purchase', '1 awaiting approval', 'Tuan Ho', '3 days', 'Normal'],
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title={t.overview.title}
        subtitle="Wednesday, 14 October 2026"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={() => toast(t.common.exportReport)}>
              <Download size={14} />
              <span>{t.common.exportReport}</span>
            </Button>
            <Button variant="ghost" size="icon" aria-label={t.common.moreOptions}>
              <MoreHorizontal size={15} />
            </Button>
          </div>
        }
      />

      {/* Filters Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="secondary">
          <Calendar size={14} className="text-muted" />
          <span>Last 30 days</span>
          <ChevronDown size={14} className="text-muted" />
        </Button>
        <Button variant="secondary">
          <span>{t.common.allDepartments}</span>
          <ChevronDown size={14} className="text-muted" />
        </Button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi
          label={t.overview.activeProjects}
          value="12"
          detail={t.overview.activeProjectsDesc}
          tone="warning"
          icon="Projects"
          onClick={() => setPage('Projects')}
        />
        <Kpi
          label="Resource allocation"
          value="78%"
          detail="8 people available"
          tone="success"
          icon="Resources"
        />
        <Kpi
          label="Outstanding receivables"
          value="₫1.24B"
          detail="₫320M overdue"
          tone="danger"
          icon="Finance"
        />
        <Kpi
          label="Open IT tickets"
          value="18"
          detail="4 approaching SLA"
          tone="warning"
          icon="IT Service"
          onClick={() => setPage('IT Service')}
        />
      </div>

      <p className="text-xs text-muted">
        <b>Resource allocation</b> = planned allocated hours ÷ available working hours. This is not
        billable utilization.
      </p>

      {/* Upper Grid: Attention & Approval Queue */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Projects Attention */}
        <Card className="flex flex-col overflow-hidden lg:col-span-2">
          <div className="flex items-center justify-between border-b border-border p-4">
            <div>
              <h2 className="text-sm font-bold text-foreground">Projects requiring attention</h2>
              <p className="text-xs text-muted">
                Projects with upcoming milestones or delivery risks
              </p>
            </div>
            <Button variant="secondary" onClick={() => setPage('Projects')}>
              View all projects
            </Button>
          </div>
          <ProjectTable onRow={onProject} />
        </Card>

        {/* Approval Queue */}
        <Card className="flex flex-col p-4">
          <div className="mb-3 flex items-center justify-between border-b border-border pb-3">
            <div>
              <h2 className="text-sm font-bold text-foreground">My approval queue</h2>
              <p className="text-xs text-muted">12 requests require your review</p>
            </div>
            <Button variant="ghost">View all</Button>
          </div>
          <div className="flex-1 space-y-3">
            {approvals.map((a, i) => (
              <div
                key={a[0]}
                className="flex items-start justify-between gap-3 rounded-lg border border-border/60 p-2.5 transition hover:bg-surface-subtle"
              >
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                    <Icon
                      name={
                        i === 0
                          ? 'Timesheets'
                          : i === 2
                            ? 'Resources'
                            : i === 3
                              ? 'IT Service'
                              : 'People'
                      }
                      size={15}
                    />
                  </div>
                  <div>
                    <strong className="block text-xs font-semibold text-foreground">{a[0]}</strong>
                    <span className="block text-xs text-muted">{a[1]}</span>
                    <small className="text-sm text-muted-foreground">
                      {a[2]} · {a[3]} ago
                    </small>
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <Badge tone={a[4] === 'High' ? 'warning' : 'neutral'}>{a[4]}</Badge>
                  <Button
                    variant="secondary"
                    className="px-2.5 py-1 text-sm"
                    onClick={() => {
                      if (a[0] === 'Equipment purchase') {
                        setPage('IT Service');
                      } else {
                        toast(`${a[0]} opened for review`);
                      }
                    }}
                  >
                    Review
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Lower Grid: Capacity, Activity, Sync */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Capacity */}
        <Card className="flex flex-col justify-between p-4">
          <div className="mb-3 flex items-center justify-between border-b border-border pb-3">
            <div>
              <h2 className="text-sm font-bold text-foreground">{t.overview.departmentCapacity}</h2>
              <p className="text-xs text-muted">{t.overview.departmentCapacitySubtitle}</p>
            </div>
            <Badge tone="info">Updated 8 min ago</Badge>
          </div>
          <div className="space-y-3">
            {[
              ['Engineering', 84, '6 available'],
              ['Quality assurance', 92, '2 overallocated'],
              ['Product & design', 71, '3 available'],
              ['Project management', 76, '2 available'],
            ].map((d, i) => (
              <div key={d[0]} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <strong className="text-foreground">{d[0]}</strong>
                  <span
                    className={
                      i === 1 ? 'font-bold text-rose-700 dark:text-rose-400' : 'text-muted'
                    }
                  >
                    {d[1]}% ({d[2]})
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full border border-border bg-surface-subtle">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${i === 1 ? 'bg-rose-500' : 'bg-primary'}`}
                    style={{ width: `${d[1]}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Activity */}
        <Card className="flex flex-col justify-between p-4">
          <div className="mb-3 border-b border-border pb-3">
            <h2 className="text-sm font-bold text-foreground">{t.overview.recentActivities}</h2>
            <p className="text-xs text-muted">{t.overview.activitySubtitle}</p>
          </div>
          <div className="space-y-3">
            {[
              ['Contract signed', 'Northstar Systems · ₫2.40B contract value', '18 min'],
              ['Employee onboarded', 'Bao Nguyen joined Engineering', '2 hr'],
              ['Milestone accepted', 'BluePeak API integration', '4 hr'],
              ['Payment recorded', '₫460M cash received · INV-2084', 'Yesterday'],
            ].map((a) => (
              <div key={a[0]} className="flex items-start gap-2.5 text-xs">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                <div className="flex-1">
                  <strong className="block leading-tight text-foreground">{a[0]}</strong>
                  <small className="text-sm text-muted">{a[1]}</small>
                </div>
                <time className="shrink-0 text-sm text-muted-foreground">{a[2]}</time>
              </div>
            ))}
          </div>
        </Card>

        {/* Google Sheets Sync */}
        <Card className="flex flex-col justify-between p-4">
          <div>
            <div className="mb-3 flex items-start justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-emerald-500/10 font-bold text-emerald-600 dark:text-emerald-400">
                  <FileSpreadsheet size={15} />
                </span>
                <div>
                  <h2 className="text-sm font-bold text-foreground">{t.overview.sheetsSync}</h2>
                  <p className="text-xs text-muted">Last sync: Today, 09:42</p>
                </div>
              </div>
              <Badge tone="warning">2 issues</Badge>
            </div>
            <div className="mb-3 space-y-1 rounded-lg border border-border bg-surface-subtle p-3 text-xs">
              <div className="flex justify-between">
                <span className="text-muted">{t.overview.processed}</span>
                <b className="text-foreground">2,418 records</b>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">{t.overview.quarantine}</span>
                <b className="font-bold text-rose-700 dark:text-rose-400">3 records</b>
              </div>
            </div>
          </div>
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => setPage('Data & Migration')}
          >
            {t.overview.reviewSyncIssues}
          </Button>
        </Card>
      </div>
    </div>
  );
}

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

export function OverviewView({
  onProject,
  setPage,
  toast,
}: {
  onProject: (p: ProjectItem) => void;
  setPage: (p: Page) => void;
  toast: (s: string) => void;
}) {
  const approvals = [
    ['Timesheets', '6 awaiting approval', 'Anh Do + 5 others', '2 days', 'High'],
    ['Leave requests', '3 awaiting approval', 'Mai Vu + 2 others', '4 hours', 'Normal'],
    ['Resource requests', '2 awaiting approval', 'Project Delivery', '1 day', 'High'],
    ['Equipment purchase', '1 awaiting approval', 'Tuan Ho', '3 days', 'Normal'],
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Operations Overview"
        subtitle="Wednesday, 14 October 2026"
        actions={
          <>
            <Button variant="secondary">
              <Calendar size={14} className="text-muted" />
              <span>Last 30 days</span>
              <ChevronDown size={14} className="text-muted" />
            </Button>
            <Button variant="secondary">
              <span>All departments</span>
              <ChevronDown size={14} className="text-muted" />
            </Button>
            <Button variant="secondary" onClick={() => toast('Report exported successfully')}>
              <Download size={14} />
              <span>Export report</span>
            </Button>
            <Button variant="ghost">
              <MoreHorizontal size={15} />
            </Button>
          </>
        }
      />

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <Kpi
          label="Active projects"
          value="12"
          detail="3 at risk"
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Projects Attention */}
        <Card className="lg:col-span-2 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-border flex items-center justify-between">
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
        <Card className="p-4 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-border mb-3">
            <div>
              <h2 className="text-sm font-bold text-foreground">My approval queue</h2>
              <p className="text-xs text-muted">12 requests require your review</p>
            </div>
            <Button variant="ghost">View all</Button>
          </div>
          <div className="space-y-3 flex-1">
            {approvals.map((a, i) => (
              <div
                key={a[0]}
                className="flex items-start justify-between gap-3 p-2.5 rounded-lg border border-border/60 hover:bg-surface-subtle transition"
              >
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary grid place-items-center shrink-0 mt-0.5">
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
                    <small className="text-[10px] text-muted-foreground">
                      {a[2]} · {a[3]} ago
                    </small>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <Badge tone={a[4] === 'High' ? 'warning' : 'neutral'}>{a[4]}</Badge>
                  <Button
                    variant="secondary"
                    className="text-[10px] px-2 py-1"
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Capacity */}
        <Card className="p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-border mb-3">
            <div>
              <h2 className="text-sm font-bold text-foreground">
                Resource allocation by department
              </h2>
              <p className="text-xs text-muted">Capacity for 12–31 October</p>
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
                  <span className={i === 1 ? 'text-rose-600 font-bold' : 'text-muted'}>
                    {d[1]}% ({d[2]})
                  </span>
                </div>
                <div className="h-2 w-full bg-surface-subtle border border-border rounded-full overflow-hidden">
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
        <Card className="p-4 flex flex-col justify-between">
          <div className="pb-3 border-b border-border mb-3">
            <h2 className="text-sm font-bold text-foreground">Recent activity</h2>
            <p className="text-xs text-muted">Across your workspace</p>
          </div>
          <div className="space-y-3">
            {[
              ['Contract signed', 'Northstar Systems · ₫2.40B contract value', '18 min'],
              ['Employee onboarded', 'Bao Nguyen joined Engineering', '2 hr'],
              ['Milestone accepted', 'BluePeak API integration', '4 hr'],
              ['Payment recorded', '₫460M cash received · INV-2084', 'Yesterday'],
            ].map((a) => (
              <div key={a[0]} className="flex items-start gap-2.5 text-xs">
                <span className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                <div className="flex-1">
                  <strong className="block text-foreground leading-tight">{a[0]}</strong>
                  <small className="text-muted text-[11px]">{a[1]}</small>
                </div>
                <time className="text-muted-foreground text-[10px] shrink-0">{a[2]}</time>
              </div>
            ))}
          </div>
        </Card>

        {/* Google Sheets Sync */}
        <Card className="p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between pb-3 border-b border-border mb-3">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold grid place-items-center">
                  <FileSpreadsheet size={15} />
                </span>
                <div>
                  <h2 className="text-sm font-bold text-foreground">Google Sheets sync</h2>
                  <p className="text-xs text-muted">Last sync: Today, 09:42</p>
                </div>
              </div>
              <Badge tone="warning">2 issues</Badge>
            </div>
            <div className="p-3 bg-surface-subtle border border-border rounded-lg space-y-1 mb-3 text-xs">
              <div className="flex justify-between">
                <span className="text-muted">Processed</span>
                <b className="text-foreground">2,418 records</b>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Quarantine / Failed</span>
                <b className="text-rose-600 font-bold">3 records</b>
              </div>
            </div>
          </div>
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => setPage('Data & Migration')}
          >
            Review sync issues
          </Button>
        </Card>
      </div>
    </div>
  );
}

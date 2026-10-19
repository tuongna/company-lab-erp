import React, { useState } from 'react';
import { Check, X } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PageHeader } from '@/components/layout/PageHeader';
import { useTranslation } from '@/lib/i18n/context';

export function PeopleView({ toast }: { toast: (s: string) => void }) {
  const { t } = useTranslation();
  const [task, setTask] = useState<string | null>(null);
  const groups = [
    [
      'Human Resources',
      [
        ['Verify employment documents', 'Linh Ho', '12 Oct', 'Complete'],
        ['Add payroll profile', 'Linh Ho', '13 Oct', 'Complete'],
      ],
    ],
    [
      'Internal IT',
      [
        ['Assign laptop and accessories', 'Quang Pham', '14 Oct', 'In progress'],
        ['Provision workspace accounts', 'System simulation', '14 Oct', 'Pending'],
      ],
    ],
    [
      'Hiring Manager',
      [
        ['Assign onboarding buddy', 'Minh Tran', '15 Oct', 'Complete'],
        ['Confirm initial project allocation', 'Minh Tran', '16 Oct', 'Pending'],
      ],
    ],
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Employee onboarding"
        subtitle="Cross-department workflow · ONB-2026-038"
        actions={<Button variant="secondary">Workflow settings</Button>}
      />
      <Card className="flex flex-wrap items-center justify-between gap-4 p-4">
        <div className="flex items-center gap-1">
          <Avatar initials="BN" className="h-10 w-10 text-xs" />
          <div>
            <h2 className="text-sm font-bold text-foreground">Bao Nguyen</h2>
            <p className="text-xs text-muted">Software Engineer · Engineering</p>
          </div>
        </div>
        <div className="flex items-center gap-6 text-sm">
          <span>
            <small className="block text-sm font-bold uppercase text-muted">MANAGER</small>
            <b>Minh Tran</b>
          </span>
          <span>
            <small className="block text-sm font-bold uppercase text-muted">START DATE</small>
            <b>19 Oct 2026</b>
          </span>
          <span>
            <small className="block text-sm font-bold uppercase text-muted">EMPLOYMENT</small>
            <b>Full-time</b>
          </span>
        </div>
        <Badge tone="info">Onboarding</Badge>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Checklist */}
        <Card className="p-4 lg:col-span-2">
          <h2 className="mb-3 text-sm font-bold text-foreground">
            Onboarding checklist (5 of 8 tasks complete)
          </h2>
          <div className="space-y-4">
            {groups.map((g) => (
              <div key={g[0] as string} className="space-y-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  {g[0] as string}
                </h3>
                <div className="space-y-1">
                  {(g[1] as string[][]).map((t) => (
                    <button
                      type="button"
                      key={t[0]}
                      onClick={() => setTask(t[0] ?? null)}
                      className="flex w-full items-center justify-between rounded-lg border border-border p-2.5 text-left text-sm transition hover:bg-surface-subtle"
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`grid h-5 w-5 place-items-center rounded text-sm ${t[3] === 'Complete' ? 'bg-emerald-500 text-white' : 'border border-border'}`}
                        >
                          {t[3] === 'Complete' && <Check size={13} />}
                        </span>
                        <div>
                          <b className="text-foreground">{t[0]}</b>
                          <small className="block text-sm text-muted">
                            Owner: {t[1]} · Due {t[2]}
                          </small>
                        </div>
                      </div>
                      <Badge
                        tone={
                          t[3] === 'Complete'
                            ? 'success'
                            : t[3] === 'In progress'
                              ? 'info'
                              : 'neutral'
                        }
                      >
                        {t[3]}
                      </Badge>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Equipment & Access */}
        <Card className="space-y-4 p-4">
          <h2 className="text-sm font-bold text-foreground">Equipment & access</h2>
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div>
              <strong className="block text-sm text-foreground">MacBook Pro 14-inch</strong>
              <small className="text-sm text-muted">Asset CL-MBP-0284 · Assigned</small>
            </div>
            <Badge tone="success">Ready</Badge>
          </div>
          <div className="space-y-2 text-xs">
            {['Google Workspace', 'GitHub Enterprise', 'Slack workspace'].map((x, i) => (
              <div key={x} className="flex justify-between border-b border-border py-1.5">
                <span className="text-muted">{x}</span>
                <Badge tone={i === 0 ? 'success' : 'warning'}>
                  {i === 0 ? 'Active' : 'Queued'}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Task Drawer Modal */}
      {task && (
        <div
          className="backdrop-blur-xs fixed inset-0 z-50 flex justify-end bg-black/50"
          onClick={() => setTask(null)}
        >
          <aside
            className="flex h-full w-full max-w-md flex-col justify-between border-l border-border bg-surface p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h2 className="text-base font-bold text-foreground">{task}</h2>
                <Button
                  variant="ghost"
                  onClick={() => setTask(null)}
                  aria-label={t.a11y.closeModal}
                >
                  <X size={16} />
                </Button>
              </div>
              <div className="space-y-3 text-xs">
                <div>
                  <label htmlFor="task-owner" className="mb-1 block text-muted">
                    {t.a11y.taskOwner}
                  </label>
                  <input
                    id="task-owner"
                    aria-label={t.a11y.taskOwner}
                    defaultValue="Quang Pham"
                    className="h-8 w-full rounded-lg border border-border bg-surface-subtle px-2.5 text-foreground"
                  />
                </div>
                <div>
                  <label htmlFor="task-due-date" className="mb-1 block text-muted">
                    {t.a11y.dueDate}
                  </label>
                  <input
                    id="task-due-date"
                    aria-label={t.a11y.dueDate}
                    defaultValue="14 Oct 2026"
                    className="h-8 w-full rounded-lg border border-border bg-surface-subtle px-2.5 text-foreground"
                  />
                </div>
                <div>
                  <label htmlFor="task-status" className="mb-1 block text-muted">
                    {t.a11y.status}
                  </label>
                  <select
                    id="task-status"
                    aria-label={t.a11y.status}
                    defaultValue="In progress"
                    className="h-8 w-full rounded-lg border border-border bg-surface-subtle px-2.5 text-foreground"
                  >
                    <option>Pending</option>
                    <option>In progress</option>
                    <option>Complete</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-border pt-4">
              <Button variant="secondary" onClick={() => setTask(null)}>
                {t.common.cancel}
              </Button>
              <Button
                onClick={() => {
                  setTask(null);
                  toast(t.common.success);
                }}
              >
                {t.common.save}
              </Button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

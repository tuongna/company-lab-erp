import React, { useState } from 'react';
import { Check, X } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PageHeader } from '@/components/layout/PageHeader';

export function PeopleView({ toast }: { toast: (s: string) => void }) {
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
      <Card className="p-4 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-1">
          <Avatar initials="BN" className="w-10 h-10 text-xs" />
          <div>
            <h2 className="text-sm font-bold text-foreground">Bao Nguyen</h2>
            <p className="text-xs text-muted">Software Engineer · Engineering</p>
          </div>
        </div>
        <div className="flex items-center gap-6 text-xs">
          <span>
            <small className="block text-muted text-[10px]">MANAGER</small>
            <b>Minh Tran</b>
          </span>
          <span>
            <small className="block text-muted text-[10px]">START DATE</small>
            <b>19 Oct 2026</b>
          </span>
          <span>
            <small className="block text-muted text-[10px]">EMPLOYMENT</small>
            <b>Full-time</b>
          </span>
        </div>
        <Badge tone="info">Onboarding</Badge>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Checklist */}
        <Card className="lg:col-span-2 p-4">
          <h2 className="text-sm font-bold text-foreground mb-3">
            Onboarding checklist (5 of 8 tasks complete)
          </h2>
          <div className="space-y-4">
            {groups.map((g) => (
              <div key={g[0] as string} className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {g[0] as string}
                </h3>
                <div className="space-y-1">
                  {(g[1] as string[][]).map((t) => (
                    <button
                      key={t[0]}
                      onClick={() => setTask(t[0] ?? null)}
                      className="w-full flex items-center justify-between p-2.5 rounded-lg border border-border hover:bg-surface-subtle transition text-left text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`w-4 h-4 rounded grid place-items-center text-[10px] ${t[3] === 'Complete' ? 'bg-emerald-500 text-white' : 'border border-border'}`}
                        >
                          {t[3] === 'Complete' && <Check size={11} />}
                        </span>
                        <div>
                          <b className="text-foreground">{t[0]}</b>
                          <small className="block text-muted text-[11px]">
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
        <Card className="p-4 space-y-4">
          <h2 className="text-sm font-bold text-foreground">Equipment & access</h2>
          <div className="p-3 border border-border rounded-lg flex items-center justify-between">
            <div>
              <strong className="block text-xs text-foreground">MacBook Pro 14-inch</strong>
              <small className="text-muted text-[11px]">Asset CL-MBP-0284 · Assigned</small>
            </div>
            <Badge tone="success">Ready</Badge>
          </div>
          <div className="space-y-2 text-xs">
            {['Google Workspace', 'GitHub Enterprise', 'Slack workspace'].map((x, i) => (
              <div key={x} className="flex justify-between py-1.5 border-b border-border">
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
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex justify-end"
          onClick={() => setTask(null)}
        >
          <aside
            className="w-full max-w-md bg-surface border-l border-border h-full p-6 flex flex-col justify-between shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h2 className="text-base font-bold text-foreground">{task}</h2>
                <Button variant="ghost" onClick={() => setTask(null)}>
                  <X size={16} />
                </Button>
              </div>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-muted mb-1">Task owner</label>
                  <input
                    defaultValue="Quang Pham"
                    className="w-full h-8 px-2.5 rounded-lg bg-surface-subtle border border-border text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-muted mb-1">Due date</label>
                  <input
                    defaultValue="14 Oct 2026"
                    className="w-full h-8 px-2.5 rounded-lg bg-surface-subtle border border-border text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-muted mb-1">Status</label>
                  <select
                    defaultValue="In progress"
                    className="w-full h-8 px-2.5 rounded-lg bg-surface-subtle border border-border text-foreground"
                  >
                    <option>Pending</option>
                    <option>In progress</option>
                    <option>Complete</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t border-border">
              <Button variant="secondary" onClick={() => setTask(null)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setTask(null);
                  toast('Task updated successfully');
                }}
              >
                Save changes
              </Button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

import React from 'react';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { PageHeader } from '@/components/layout/PageHeader';

export function MyWorkView({ toast }: { toast: (s: string) => void }) {
  return (
    <div className="max-w-4xl space-y-4">
      <PageHeader
        title="My Work"
        subtitle="Wednesday, 14 October"
        actions={<Avatar className="h-8 w-8" />}
      />
      <Card className="border-none bg-primary p-4 text-primary-foreground">
        <span className="block text-xs text-blue-100 dark:text-blue-200">Good morning, Nadia</span>
        <strong className="text-base font-bold">You have 4 items to complete today</strong>
      </Card>
      <div className="grid grid-cols-3 gap-3">
        {(
          [
            ['Submit timesheet', 'Timesheets'],
            ['Request leave', 'People'],
            ['Report IT issue', 'IT Service'],
          ] as const
        ).map(([actionName, iconName]) => (
          <button
            type="button"
            onClick={() => toast(`${actionName} opened`)}
            key={actionName}
            className="space-y-1 rounded-xl border border-border bg-surface p-3 text-center transition hover:border-primary"
          >
            <div className="mx-auto grid h-7 w-7 place-items-center rounded-lg bg-primary/10 text-primary">
              <Icon name={iconName} size={15} />
            </div>
            <strong className="block text-xs text-foreground">{actionName}</strong>
          </button>
        ))}
      </div>
      <Card className="space-y-3 p-4">
        <h2 className="text-sm font-bold text-foreground">My tasks</h2>
        <div className="space-y-2">
          {[
            ['Review resource request', 'Customer Portal needs 2 engineers', 'Today', 'High'],
            ['Approve weekly timesheets', '6 team submissions', 'Today', 'High'],
            ['Confirm project allocation', 'Bao Nguyen onboarding', 'Tomorrow', 'Normal'],
          ].map((x) => (
            <div
              key={x[0]}
              className="flex items-center justify-between rounded-lg border border-border p-3 text-xs"
            >
              <div>
                <div className="flex items-center gap-2">
                  <Badge tone={x[3] === 'High' ? 'warning' : 'neutral'}>{x[3]}</Badge>
                  <small className="text-muted">{x[2]}</small>
                </div>
                <strong className="mt-1 block text-foreground">{x[0]}</strong>
                <p className="text-muted">{x[1]}</p>
              </div>
              <Button variant="secondary">View details</Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

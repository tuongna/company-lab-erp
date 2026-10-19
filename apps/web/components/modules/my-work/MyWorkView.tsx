import React from 'react';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { PageHeader } from '@/components/layout/PageHeader';

export function MyWorkView({ toast }: { toast: (s: string) => void }) {
  return (
    <div className="space-y-4 max-w-4xl">
      <PageHeader
        title="My Work"
        subtitle="Wednesday, 14 October"
        actions={<Avatar className="w-8 h-8" />}
      />
      <Card className="p-4 bg-primary text-primary-foreground border-none">
        <span className="text-xs opacity-80 block">Good morning, Nadia</span>
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
            onClick={() => toast(`${actionName} opened`)}
            key={actionName}
            className="p-3 bg-surface border border-border rounded-xl text-center space-y-1 hover:border-primary transition"
          >
            <div className="w-7 h-7 mx-auto rounded-lg bg-primary/10 text-primary grid place-items-center">
              <Icon name={iconName} size={15} />
            </div>
            <strong className="block text-xs text-foreground">{actionName}</strong>
          </button>
        ))}
      </div>
      <Card className="p-4 space-y-3">
        <h2 className="text-sm font-bold text-foreground">My tasks</h2>
        <div className="space-y-2">
          {[
            ['Review resource request', 'Customer Portal needs 2 engineers', 'Today', 'High'],
            ['Approve weekly timesheets', '6 team submissions', 'Today', 'High'],
            ['Confirm project allocation', 'Bao Nguyen onboarding', 'Tomorrow', 'Normal'],
          ].map((x) => (
            <div
              key={x[0]}
              className="p-3 border border-border rounded-lg flex items-center justify-between text-xs"
            >
              <div>
                <div className="flex items-center gap-2">
                  <Badge tone={x[3] === 'High' ? 'warning' : 'neutral'}>{x[3]}</Badge>
                  <small className="text-muted">{x[2]}</small>
                </div>
                <strong className="block text-foreground mt-1">{x[0]}</strong>
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

import React from 'react';
import { Badge } from '@/components/ui/badge';

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col justify-between gap-3 pb-2 sm:flex-row sm:items-start">
      <div>
        <div className="flex items-start gap-2.5 py-1">
          <h1 className="text-xl font-bold tracking-tight text-foreground">{title}</h1>
          {title === 'Operations Overview' && (
            <Badge tone="info" className="my-px shrink-0">
              Demo workspace
            </Badge>
          )}
        </div>
        <p className="mt-0.5 text-xs text-muted">{subtitle}</p>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2 sm:justify-end">{actions}</div>}
    </div>
  );
}

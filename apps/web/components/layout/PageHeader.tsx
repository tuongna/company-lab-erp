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
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl font-bold tracking-tight text-foreground">{title}</h1>
          {title === 'Operations Overview' && <Badge tone="info">Demo workspace</Badge>}
        </div>
        <p className="text-xs text-muted mt-0.5">{subtitle}</p>
      </div>
      {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
    </div>
  );
}

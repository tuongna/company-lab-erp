import React from 'react';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';

export function Kpi({
  label,
  value,
  detail,
  tone,
  icon,
  onClick,
}: {
  label: string;
  value: string;
  detail: string;
  tone: string;
  icon: string;
  onClick?: () => void;
}) {
  const toneMap: Record<string, string> = {
    warning: 'text-amber-600 dark:text-amber-400 bg-amber-500/10',
    success: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10',
    danger: 'text-rose-600 dark:text-rose-400 bg-rose-500/10',
    info: 'text-sky-600 dark:text-sky-400 bg-sky-500/10',
  };
  return (
    <Card
      className={`p-4 flex flex-col justify-between gap-3 ${onClick ? 'cursor-pointer hover:border-primary/50 transition' : ''}`}
    >
      <div className="flex items-center justify-between" onClick={onClick}>
        <span className="text-xs font-medium text-muted">{label}</span>
        <span
          className={`w-7 h-7 rounded-lg grid place-items-center ${toneMap[tone] || toneMap.info}`}
        >
          <Icon name={icon} size={15} />
        </span>
      </div>
      <strong className="text-2xl font-bold text-foreground tracking-tight" onClick={onClick}>
        {value}
      </strong>
      <span className="text-xs flex items-center gap-1.5 text-muted">
        <span
          className={`w-1.5 h-1.5 rounded-full ${tone === 'danger' ? 'bg-rose-500' : tone === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'}`}
        />
        {detail}
      </span>
    </Card>
  );
}

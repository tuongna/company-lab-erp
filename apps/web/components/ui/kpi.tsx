import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

export const kpiToneVariants = cva('w-7 h-7 rounded-lg grid place-items-center shrink-0', {
  variants: {
    tone: {
      info: 'text-sky-800 dark:text-sky-300 bg-sky-500/10',
      success: 'text-emerald-800 dark:text-emerald-300 bg-emerald-500/10',
      warning: 'text-amber-800 dark:text-amber-300 bg-amber-500/10',
      danger: 'text-rose-800 dark:text-rose-300 bg-rose-500/10',
    },
  },
  defaultVariants: {
    tone: 'info',
  },
});

export type KpiTone = 'info' | 'success' | 'warning' | 'danger';

const dotToneMap: Record<KpiTone, string> = {
  danger: 'bg-rose-500',
  warning: 'bg-amber-500',
  success: 'bg-emerald-500',
  info: 'bg-sky-500',
};

export interface KpiProps
  extends
    Omit<React.HTMLAttributes<HTMLDivElement>, 'onClick'>,
    Omit<VariantProps<typeof kpiToneVariants>, 'tone'> {
  label: string;
  value: string;
  detail: string;
  tone?: KpiTone | (string & {});
  icon: string;
  onClick?: () => void;
}

export function Kpi({
  label,
  value,
  detail,
  tone = 'info',
  icon,
  onClick,
  className,
  ...props
}: KpiProps) {
  const activeTone = (tone && tone in dotToneMap ? tone : 'info') as KpiTone;
  const isInteractive = Boolean(onClick);

  return (
    <Card
      variant={isInteractive ? 'interactive' : 'default'}
      padding="md"
      className={cn('flex flex-col justify-between gap-3', className)}
      onClick={onClick}
      {...props}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted">{label}</span>
        <span className={cn(kpiToneVariants({ tone: activeTone }))}>
          <Icon name={icon} size={15} />
        </span>
      </div>
      <strong className="text-2xl font-bold tracking-tight text-foreground">{value}</strong>
      <span className="flex items-center gap-1.5 text-xs text-muted">
        <span
          className={cn('h-1.5 w-1.5 shrink-0 rounded-full', dotToneMap[activeTone])}
          aria-hidden="true"
        />
        {detail}
      </span>
    </Card>
  );
}

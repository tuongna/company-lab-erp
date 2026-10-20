import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

export const badgeVariants = cva(
  'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-sm font-medium transition-colors',
  {
    variants: {
      tone: {
        neutral: 'border-slate-500/20 bg-slate-500/10 text-slate-700 dark:text-slate-300',
        success: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300',
        warning: 'border-amber-500/20 bg-amber-500/10 text-amber-800 dark:text-amber-300',
        danger: 'border-rose-500/20 bg-rose-500/10 text-rose-800 dark:text-rose-300',
        info: 'border-sky-500/20 bg-sky-500/10 text-sky-800 dark:text-sky-300',
        indigo: 'border-indigo-500/20 bg-indigo-500/10 text-indigo-800 dark:text-indigo-300',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-0.5 text-sm',
      },
    },
    defaultVariants: {
      tone: 'neutral',
      size: 'md',
    },
  },
);

export type BadgeTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'indigo';

const dotVariants: Record<string, string> = {
  neutral: 'bg-slate-400',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-rose-500',
  info: 'bg-sky-500',
  indigo: 'bg-indigo-500',
};

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>, Omit<VariantProps<typeof badgeVariants>, 'tone'> {
  tone?: BadgeTone | (string & {});
  showDot?: boolean;
}

export function Badge({
  children,
  tone = 'neutral',
  size,
  showDot = true,
  className,
  ...props
}: BadgeProps) {
  const activeTone = (tone && tone in dotVariants ? tone : 'neutral') as BadgeTone;
  const dotColor = dotVariants[activeTone] ?? dotVariants.neutral;

  return (
    <span className={cn(badgeVariants({ tone: activeTone, size }), className)} {...props}>
      {showDot && (
        <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', dotColor)} aria-hidden="true" />
      )}
      {children}
    </span>
  );
}

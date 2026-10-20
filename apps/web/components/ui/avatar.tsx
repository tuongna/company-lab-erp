import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

export const avatarVariants = cva(
  'shrink-0 rounded-full font-bold inline-grid place-items-center select-none',
  {
    variants: {
      size: {
        sm: 'w-6 h-6 text-xs',
        md: 'w-7.5 h-7.5 text-sm',
        lg: 'w-9 h-9 text-base',
      },
      tone: {
        primary: 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300',
        neutral: 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
        emerald: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300',
        amber: 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300',
      },
    },
    defaultVariants: {
      size: 'md',
      tone: 'primary',
    },
  },
);

export interface AvatarProps
  extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof avatarVariants> {
  initials?: string;
}

export function Avatar({
  initials = 'NL',
  size = 'md',
  tone = 'primary',
  className,
  ...props
}: AvatarProps) {
  return (
    <span className={cn(avatarVariants({ size, tone }), className)} {...props}>
      {initials}
    </span>
  );
}

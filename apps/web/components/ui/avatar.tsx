import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

export const avatarVariants = cva(
  'inline-grid shrink-0 select-none place-items-center rounded-full font-bold',
  {
    variants: {
      size: {
        sm: 'h-6 w-6 text-xs',
        md: 'h-8 w-8 text-sm',
        lg: 'h-10 w-10 text-base',
      },
      tone: {
        primary: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
        neutral: 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
        emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
        amber: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
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

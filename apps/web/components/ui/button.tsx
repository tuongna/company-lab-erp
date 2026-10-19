import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

export const buttonVariants = cva(
  'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer gap-1.5 shrink-0 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 active:scale-[0.98]',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground hover:bg-primary-hover shadow-xs',
        secondary:
          'bg-surface text-foreground hover:bg-surface-subtle border border-border shadow-2xs',
        ghost:
          'text-muted-foreground hover:text-foreground hover:bg-surface-subtle active:scale-100',
        danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs',
        outline:
          'border border-border bg-transparent hover:bg-surface-subtle text-foreground shadow-2xs',
      },
      size: {
        sm: 'h-7 min-w-7 px-2.5 text-xs',
        md: 'h-8 min-w-8 px-3 text-xs',
        lg: 'h-10 min-w-10 px-4 text-sm',
        icon: 'h-8 w-8 min-w-8 p-1.5 text-xs',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}

export function Button({
  children,
  variant = 'primary',
  size,
  disabled = false,
  className,
  type = 'button',
  ...props
}: ButtonProps) {
  // If variant is ghost and no size provided, default to icon padding for backward-compatibility
  const resolvedSize = size ?? (variant === 'ghost' ? 'icon' : 'md');

  return (
    <button
      type={type}
      disabled={disabled}
      className={cn(buttonVariants({ variant, size: resolvedSize }), className)}
      {...props}
    >
      {children}
    </button>
  );
}

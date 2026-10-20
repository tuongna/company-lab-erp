import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

export const buttonVariants = cva(
  'inline-flex shrink-0 cursor-pointer select-none items-center justify-center gap-1.5 rounded-lg font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'shadow-xs bg-primary text-primary-foreground hover:bg-primary-hover',
        secondary:
          'shadow-2xs border border-border bg-surface text-foreground hover:bg-surface-subtle',
        ghost:
          'text-muted-foreground hover:bg-surface-subtle hover:text-foreground active:scale-100',
        danger: 'shadow-xs bg-rose-600 text-white hover:bg-rose-700',
        outline:
          'shadow-2xs border border-border bg-transparent text-foreground hover:bg-surface-subtle',
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
  return (
    <button
      type={type}
      disabled={disabled}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    >
      {children}
    </button>
  );
}

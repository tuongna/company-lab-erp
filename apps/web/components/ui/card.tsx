import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

export const cardVariants = cva('rounded-xl text-foreground transition-colors', {
  variants: {
    variant: {
      default: 'bg-surface border border-border shadow-[var(--card-shadow)]',
      subtle: 'bg-surface-subtle border border-border',
      outline: 'border border-border bg-transparent',
      interactive:
        'bg-surface border border-border shadow-[var(--card-shadow)] hover:border-primary/50 cursor-pointer transition-all',
    },
    padding: {
      none: '',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-5',
    },
  },
  defaultVariants: {
    variant: 'default',
    padding: 'none',
  },
});

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof cardVariants> {
  as?: 'div' | 'section' | 'article';
}

export function Card({
  children,
  variant = 'default',
  padding = 'none',
  className,
  as: Component = 'section',
  ...props
}: CardProps) {
  return (
    <Component className={cn(cardVariants({ variant, padding }), className)} {...props}>
      {children}
    </Component>
  );
}

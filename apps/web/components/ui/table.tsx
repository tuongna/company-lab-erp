import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Standard column presets categorized by data type.
 * All dimension constraints use Tailwind spacing tokens or `rem` units.
 */
export const COLUMN_PRESETS = {
  /** Checkbox selection column - compact, centered */
  selection: 'w-12 min-w-[3rem] max-w-[3rem] text-center shrink-0',

  /** Identifier / Legacy codes (e.g. REQ-2026-001, LP-M3-009) */
  code: 'min-w-[7.5rem] whitespace-nowrap font-mono font-medium',

  /** Status badges, pills, short tags */
  badge: 'min-w-[8.5rem] whitespace-nowrap',

  /** Date & timestamp columns (e.g. 19/10/2026 15:30) */
  datetime: 'min-w-[9.5rem] whitespace-nowrap text-muted',

  /** Numeric values, budget, currency, quantities (right-aligned, tabular nums) */
  numeric: 'min-w-[7rem] whitespace-nowrap text-right tabular-nums',

  /** Person / Employee / User card (Avatar + Name + Department/Email) */
  person: 'min-w-[12.5rem]',

  /** Descriptive content, equipment name, reason, notes (flexible) */
  content: 'min-w-[14rem]',

  /** Action buttons, dropdown triggers, chevron detail links */
  actions: 'w-16 min-w-[4.5rem] whitespace-nowrap text-right shrink-0',
} as const;

export type ColumnPreset = keyof typeof COLUMN_PRESETS;

export interface TableContainerProps extends React.HTMLAttributes<HTMLDivElement> {}

export const TableContainer = React.forwardRef<HTMLDivElement, TableContainerProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('relative w-full overflow-x-auto rounded-lg border border-border', className)}
      {...props}
    >
      {children}
    </div>
  ),
);
TableContainer.displayName = 'TableContainer';

export interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  layout?: 'auto' | 'fixed';
}

export const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className, layout = 'auto', ...props }, ref) => (
    <table
      ref={ref}
      className={cn(
        'w-full text-left text-sm',
        layout === 'fixed' ? 'table-fixed' : 'table-auto',
        className,
      )}
      {...props}
    />
  ),
);
Table.displayName = 'Table';

export const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn(
      'border-b border-border bg-surface-subtle text-sm font-semibold uppercase text-muted',
      className,
    )}
    {...props}
  />
));
TableHeader.displayName = 'TableHeader';

export const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody ref={ref} className={cn('divide-y divide-border', className)} {...props} />
));
TableBody.displayName = 'TableBody';

export const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr ref={ref} className={cn('transition hover:bg-surface-subtle', className)} {...props} />
));
TableRow.displayName = 'TableRow';

export interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  preset?: ColumnPreset;
}

export const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className, preset, children, ...props }, ref) => (
    <th
      ref={ref}
      className={cn('relative px-4 py-3', preset && COLUMN_PRESETS[preset], className)}
      {...props}
    >
      {children}
    </th>
  ),
);
TableHead.displayName = 'TableHead';

export interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  preset?: ColumnPreset;
}

export const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className, preset, children, ...props }, ref) => (
    <td
      ref={ref}
      className={cn('relative px-4 py-3', preset && COLUMN_PRESETS[preset], className)}
      {...props}
    >
      {children}
    </td>
  ),
);
TableCell.displayName = 'TableCell';

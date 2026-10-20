'use client';

import React, { useState, useRef, useEffect, useId } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SelectOption<T extends string = string> {
  value: T;
  label: string;
}

export interface SelectProps<T extends string = string> {
  value: T;
  onChange: (value: T) => void;
  options: SelectOption<T>[];
  placeholder?: string;
  ariaLabel?: string;
  className?: string;
  triggerClassName?: string;
  menuClassName?: string;
  disabled?: boolean;
}

export function Select<T extends string = string>({
  value,
  onChange,
  options,
  placeholder,
  ariaLabel,
  className,
  triggerClassName,
  menuClassName,
  disabled = false,
}: SelectProps<T>) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && open) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const selectedOption = options.find((opt) => opt.value === value);
  const displayLabel = selectedOption ? selectedOption.label : (placeholder ?? '');

  return (
    <div className={cn('relative inline-block text-left', className)} ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        aria-label={ariaLabel || displayLabel}
        className={cn(
          'shadow-2xs inline-flex h-8 cursor-pointer items-center justify-between gap-2 rounded-lg border border-border bg-surface px-2.5 text-xs font-medium text-foreground transition hover:bg-surface-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-50',
          triggerClassName,
        )}
      >
        <span className="truncate">{displayLabel}</span>
        <ChevronDown
          className={cn(
            'h-3.5 w-3.5 shrink-0 text-muted transition-transform duration-150',
            open && 'rotate-180',
          )}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div
          id={listboxId}
          role="listbox"
          aria-label={ariaLabel || displayLabel}
          className={cn(
            'animate-in fade-in zoom-in-95 absolute left-0 z-50 mt-1.5 w-max min-w-full max-w-xs rounded-xl border border-border bg-surface py-1 text-foreground shadow-xl duration-100',
            menuClassName,
          )}
        >
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={cn(
                  'flex w-full cursor-pointer items-center justify-between gap-3 px-3 py-1.5 text-left text-xs transition hover:bg-surface-subtle',
                  isSelected ? 'bg-primary/5 font-semibold text-primary' : 'text-foreground',
                )}
              >
                <span className="truncate">{opt.label}</span>
                {isSelected && (
                  <Check className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

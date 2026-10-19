'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/context';
import { SUPPORTED_LOCALES } from '@/lib/i18n/types';
import { FlagIcon } from '@/components/ui/flag-icon';
import { cn } from '@/lib/utils';

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useTranslation();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentOption = SUPPORTED_LOCALES.find((l) => l.code === locale) || SUPPORTED_LOCALES[0]!;

  return (
    <div className="relative shrink-0" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={`${t.topbar.switchLanguage}: ${currentOption.label}`}
        title={`${t.topbar.switchLanguage}: ${currentOption.label}`}
        className="shadow-2xs flex h-8 items-center gap-1.5 rounded-lg border border-border bg-surface px-2 text-sm font-medium text-foreground transition hover:bg-surface-subtle sm:gap-2 sm:px-2.5"
      >
        <FlagIcon code={currentOption.code} className="h-[13px] w-[18px] shrink-0" />
        <span className="hidden text-sm font-semibold tracking-wide sm:inline">
          {currentOption.label}
        </span>
        <ChevronDown
          size={14}
          className={cn(
            'shrink-0 text-muted transition-transform duration-150',
            open && 'rotate-180',
          )}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div
          role="menu"
          aria-orientation="vertical"
          className="animate-in fade-in zoom-in-95 absolute right-0 z-50 mt-1.5 w-44 rounded-xl border border-border bg-surface py-1 text-foreground shadow-xl duration-100"
        >
          <div className="border-b border-border/60 px-3 py-1.5 text-sm font-bold uppercase tracking-wider text-muted-foreground">
            {t.topbar.switchLanguage}
          </div>
          {SUPPORTED_LOCALES.map((opt) => {
            const isSelected = opt.code === locale;
            return (
              <button
                key={opt.code}
                type="button"
                role="menuitem"
                onClick={() => {
                  setLocale(opt.code);
                  setOpen(false);
                }}
                className={cn(
                  'flex w-full items-center justify-between px-3 py-2 text-left text-sm transition hover:bg-surface-subtle',
                  isSelected ? 'bg-primary/5 font-bold text-primary' : 'text-foreground',
                )}
              >
                <div className="flex items-center gap-2.5">
                  <FlagIcon code={opt.code} className="h-[13px] w-[18px]" />
                  <span>{opt.label}</span>
                </div>
                {isSelected && <Check size={14} className="shrink-0 text-primary" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

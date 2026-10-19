import React from 'react';
import { ChevronRight, Search, X } from 'lucide-react';
import { Page } from '@/lib/types/navigation';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { useTranslation } from '@/lib/i18n/context';

export function QuickDialogs({
  search,
  setSearch,
  create,
  setCreate,
  setPage,
}: {
  search: boolean;
  setSearch: (v: boolean) => void;
  create: boolean;
  setCreate: (v: boolean) => void;
  setPage: (p: Page) => void;
}) {
  const { t } = useTranslation();

  if (!search && !create) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={search ? t.dialogs.quickNavigation : t.dialogs.createNewTitle}
      className="backdrop-blur-xs fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 pt-[12vh]"
      onClick={() => {
        setSearch(false);
        setCreate(false);
      }}
    >
      <div
        className="w-full max-w-lg rounded-xl border border-border bg-surface p-4 text-foreground shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {search ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <Search className="h-4 w-4 text-muted" />
              <input
                autoFocus
                placeholder={t.common.searchPlaceholder}
                aria-label={t.common.searchPlaceholder}
                className="flex-1 border-0 bg-transparent text-xs text-foreground outline-none placeholder:text-muted"
              />
              <kbd className="rounded border border-border bg-surface-subtle px-1.5 py-0.5 font-mono text-sm text-muted">
                ESC
              </kbd>
            </div>
            <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              {t.dialogs.quickNavigation}
            </p>
            <div className="space-y-1">
              {[
                { label: `${t.navigation.itService} (IT Asset Allocation)`, target: 'IT Service' },
                { label: t.navigation.overview, target: 'Overview' },
                { label: t.navigation.projects, target: 'Projects' },
                { label: t.navigation.people, target: 'People' },
                { label: t.navigation.dataMigration, target: 'Data & Migration' },
                { label: t.navigation.myWork, target: 'My Work' },
              ].map((x) => (
                <button
                  type="button"
                  key={x.label}
                  onClick={() => {
                    setPage(x.target as Page);
                    setSearch(false);
                  }}
                  className="flex w-full items-center justify-between rounded-lg p-2 text-sm transition hover:bg-surface-subtle"
                >
                  <div className="flex items-center gap-2">
                    <Icon name={x.target} size={15} />
                    <span>{x.label}</span>
                  </div>
                  <span className="font-mono text-sm text-muted">↵</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h2 className="text-sm font-bold text-foreground">{t.dialogs.createNewTitle}</h2>
                <p className="text-sm text-muted">{t.dialogs.createNewDesc}</p>
              </div>
              <Button
                variant="ghost"
                onClick={() => setCreate(false)}
                aria-label={t.dialogs.closeDialog}
              >
                <X size={16} />
              </Button>
            </div>
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-sm text-amber-800 dark:text-amber-300">
              {t.dialogs.shadowNotice}
            </div>
            <div className="space-y-1">
              {[
                { label: t.navigation.itService, target: 'IT Service' },
                { label: t.navigation.projects, target: 'Projects' },
                { label: t.navigation.people, target: 'People' },
                { label: t.navigation.dataMigration, target: 'Data & Migration' },
              ].map((x) => (
                <button
                  type="button"
                  key={x.label}
                  onClick={() => {
                    setPage(x.target as Page);
                    setCreate(false);
                  }}
                  className="flex w-full items-center justify-between rounded-lg p-2.5 text-sm transition hover:bg-surface-subtle"
                >
                  <div className="flex items-center gap-2.5">
                    <Icon name={x.target} size={16} className="text-primary" />
                    <div className="text-left">
                      <b className="block text-foreground">{x.label}</b>
                      <small className="text-sm text-muted">{t.common.details}</small>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-muted" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

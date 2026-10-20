import React from 'react';
import { Menu, Moon, Plus, Search, Sun } from 'lucide-react';
import { Page } from '@/lib/types/navigation';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useTranslation } from '@/lib/i18n/context';

export function Topbar({
  page,
  openSearch,
  openCreate,
  toggleMobile,
  theme,
  toggleTheme,
}: {
  page: Page;
  openSearch: () => void;
  openCreate: () => void;
  toggleMobile: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}) {
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between border-b border-border bg-surface px-3 sm:px-4 md:px-6">
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={toggleMobile}
          aria-label={t.navigation.toggleMobileMenu}
        >
          <Menu className="h-4 w-4" />
        </Button>
        <div className="flex min-w-0 items-center gap-1.5 text-xs text-muted">
          <span className="hidden sm:inline">CompanyLab</span>
          <span className="hidden text-muted-foreground sm:inline">/</span>
          <strong className="max-w-[120px] truncate font-semibold text-foreground sm:max-w-none">
            {page}
          </strong>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        <button
          type="button"
          onClick={openSearch}
          aria-label={t.topbar.searchWorkspace}
          title={t.topbar.searchWorkspace}
          className="shadow-xs flex h-8 min-w-8 items-center justify-center gap-2 rounded-lg border border-border bg-surface-subtle px-2 text-xs text-muted transition hover:border-slate-400 dark:hover:border-slate-500 sm:pl-3 sm:pr-0.5"
        >
          <Search className="h-3.5 w-3.5 shrink-0" />
          <span className="hidden sm:inline">{t.common.search}...</span>
          <kbd className="shadow-2xs hidden rounded-[0.375rem] border border-border bg-surface px-1.5 py-0.5 font-mono text-[14px] text-muted-foreground md:block">
            {t.topbar.searchKeyboardHint}
          </kbd>
        </button>

        <Button
          onClick={openCreate}
          aria-label={t.topbar.createNew}
          title={t.topbar.createNew}
          className="px-2 sm:px-3"
        >
          <Plus size={15} className="shrink-0" />
          <span className="hidden sm:inline">{t.topbar.createNew}</span>
        </Button>

        {/* Language Switcher */}
        <LanguageSwitcher />

        {/* Theme Toggle Button */}
        <Button
          variant="secondary"
          size="icon"
          onClick={toggleTheme}
          aria-label={theme === 'light' ? t.topbar.switchToDark : t.topbar.switchToLight}
          title={theme === 'light' ? t.topbar.switchToDark : t.topbar.switchToLight}
        >
          {theme === 'light' ? (
            <Moon size={15} className="shrink-0 text-slate-600" />
          ) : (
            <Sun size={15} className="shrink-0 text-amber-400" />
          )}
        </Button>

        <Avatar className="!h-8 !w-8 shrink-0 text-xs" />
      </div>
    </header>
  );
}

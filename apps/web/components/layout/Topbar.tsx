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
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between border-b border-border bg-surface px-3 md:px-5 lg:px-6">
      <div className="flex min-w-0 items-center gap-2">
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
          <span className="hidden font-medium sm:inline">CompanyLab</span>
          <span className="hidden text-muted-foreground sm:inline">/</span>
          <strong className="truncate font-semibold text-foreground">{page}</strong>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        <button
          type="button"
          onClick={openSearch}
          aria-label={t.topbar.searchWorkspace}
          title={t.topbar.searchWorkspace}
          className="shadow-xs flex h-8 items-center justify-center gap-2 rounded-lg border border-border bg-surface-subtle px-2 text-xs text-muted transition hover:border-slate-400 dark:hover:border-slate-500 lg:pl-3 lg:pr-0.5"
        >
          <Search className="h-3.5 w-3.5 shrink-0" />
          <span className="hidden lg:inline">{t.common.search}...</span>
          <kbd className="shadow-2xs hidden rounded-md border border-border bg-surface px-1.5 py-0.5 font-mono text-sm text-muted-foreground lg:block">
            {t.topbar.searchKeyboardHint}
          </kbd>
        </button>

        <Button
          onClick={openCreate}
          aria-label={t.topbar.createNew}
          title={t.topbar.createNew}
          className="h-8 px-2.5 lg:px-3"
        >
          <Plus className="h-4 w-4 shrink-0" />
          <span className="hidden lg:inline">{t.topbar.createNew}</span>
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
            <Moon className="h-4 w-4 shrink-0 text-slate-600" />
          ) : (
            <Sun className="h-4 w-4 shrink-0 text-amber-400" />
          )}
        </Button>

        <Avatar className="!h-8 !w-8 shrink-0 text-xs" />
      </div>
    </header>
  );
}

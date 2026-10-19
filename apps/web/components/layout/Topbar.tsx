import React from 'react';
import { Menu, Moon, Plus, Search, Sun } from 'lucide-react';
import { Page } from '@/lib/types/navigation';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';

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
  return (
    <header className="h-14 bg-surface border-b border-border px-4 md:px-6 flex items-center justify-between sticky top-0 z-20 shrink-0">
      <div className="flex items-center gap-3">
        <Button variant="ghost" className="md:hidden" onClick={toggleMobile}>
          <Menu className="w-4 h-4" />
        </Button>
        <div className="flex items-center gap-1.5 text-xs text-muted">
          <span>CompanyLab</span>
          <span className="text-muted-foreground">/</span>
          <strong className="font-semibold text-foreground">{page}</strong>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={openSearch}
          className="hidden sm:flex items-center gap-2 h-8 pl-3 pr-1 rounded-lg bg-surface-subtle border border-border text-xs text-muted hover:border-slate-400 dark:hover:border-slate-500 transition shadow-xs"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Search anything...</span>
          <kbd className="font-mono text-[14px] bg-surface border border-border px-1.5 py-0.5 rounded text-muted-foreground shadow-2xs">
            ⌘ K
          </kbd>
        </button>

        <Button onClick={openCreate} className="!p-2">
          <Plus size={15} /> <span className="hidden lg:inline">Create</span>
        </Button>

        {/* Theme Toggle Button */}
        <Button
          variant="secondary"
          onClick={toggleTheme}
          className="p-1.5 w-8 h-8 rounded-lg"
          title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        >
          {theme === 'light' ? (
            <Moon size={15} className="text-slate-600 shrink-0" />
          ) : (
            <Sun size={15} className="text-amber-400 shrink-0" />
          )}
        </Button>

        <Avatar className="!w-8 !h-8 text-xs" />
      </div>
    </header>
  );
}

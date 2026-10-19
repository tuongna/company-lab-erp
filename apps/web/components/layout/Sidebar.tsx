import React from 'react';
import Link from 'next/link';
import { ChevronsLeft, HelpCircle, MoreHorizontal } from 'lucide-react';
import { Page, PAGE_ROUTES } from '@/lib/types/navigation';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Icon } from '@/components/ui/icon';
import { useTranslation } from '@/lib/i18n/context';
import { Translations } from '@/lib/i18n/types';
import { cn } from '@/lib/utils';

const navGroups = [
  { label: '', items: ['Overview', 'My Work'] as Page[] },
  {
    label: 'Business',
    items: [
      'IT Service',
      'Projects',
      'People',
      'Resources',
      'Timesheets',
      'Finance',
      'Sales',
    ] as Page[],
  },
  { label: 'Administration', items: ['Data & Migration', 'Reports', 'Settings'] as Page[] },
];

const navItemKeys: Record<Page, keyof Translations['navigation']> = {
  Overview: 'overview',
  'My Work': 'myWork',
  'IT Service': 'itService',
  Projects: 'projects',
  People: 'people',
  Resources: 'resources',
  Timesheets: 'timesheets',
  Finance: 'finance',
  Sales: 'sales',
  'Data & Migration': 'dataMigration',
  Reports: 'reports',
  Settings: 'settings',
};

const groupLabels: Record<string, keyof Translations['navigation']> = {
  Business: 'businessGroup',
  Administration: 'adminGroup',
};

export function Sidebar({
  page,
  setPage,
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
}: {
  page: Page;
  setPage?: (p: Page) => void;
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
}) {
  const { t, locale } = useTranslation();

  const choose = (item: Page) => {
    if (setPage) setPage(item);
    setMobileOpen(false);
  };

  return (
    <aside
      className={cn(
        'fixed bottom-0 left-0 top-0 z-30 flex select-none flex-col border-r border-sidebar-border bg-sidebar-bg transition-all duration-200',
        collapsed ? 'w-[4.5rem]' : 'w-60',
        mobileOpen ? '!w-[16.875rem] translate-x-0' : 'max-md:-translate-x-full',
      )}
    >
      {/* Brand Header */}
      <div
        className={cn(
          'flex h-16 shrink-0 items-center border-b border-sidebar-border px-3.5',
          collapsed ? 'justify-center' : 'justify-between',
        )}
      >
        {!collapsed && (
          <div className="flex flex-1 items-center gap-2.5 overflow-hidden">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary text-sm font-black text-primary-foreground shadow-sm">
              C
            </span>
            <div className="flex min-w-0 flex-col">
              <strong className="truncate text-sm font-bold leading-tight text-foreground">
                CompanyLab
              </strong>
              <small className="truncate text-sm text-muted">
                {t.navigation.operationsWorkspace}
              </small>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="hidden text-muted hover:text-foreground md:inline-flex"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? t.navigation.expandSidebar : t.navigation.collapseSidebar}
        >
          <ChevronsLeft
            className={cn('h-4 w-4 transition-transform duration-200', collapsed && 'rotate-180')}
          />
        </Button>
      </div>

      {/* Navigation Links */}
      <nav
        className="flex-1 space-y-4 overflow-y-auto px-3 py-3"
        aria-label={t.navigation.mainMenu}
      >
        {navGroups.map((group) => (
          <div key={group.label || 'main'} className="space-y-0.5">
            {group.label && !collapsed && (
              <span className="block px-2 py-1 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                {t.navigation[groupLabels[group.label] || 'businessGroup']}
              </span>
            )}
            {group.items.map((item) => {
              const active = page === item;
              const labelKey = navItemKeys[item];
              const localizedLabel = labelKey ? t.navigation[labelKey] : item;
              const routeSlug = PAGE_ROUTES[item] || 'overview';
              const href = `/${locale}/${routeSlug}`;

              return (
                <Link
                  href={href}
                  key={item}
                  onClick={() => choose(item)}
                  aria-label={localizedLabel}
                  className={cn(
                    'flex h-9 w-full items-center rounded-lg px-2 text-xs font-medium transition-colors',
                    active
                      ? 'shadow-xs bg-sidebar-active font-semibold text-sidebar-activeFg'
                      : 'text-muted hover:bg-surface-subtle hover:text-foreground',
                  )}
                  title={collapsed ? localizedLabel : undefined}
                >
                  <span className="grid h-8 w-8 shrink-0 place-items-center">
                    <Icon name={item} size={16} className="shrink-0" />
                  </span>
                  {!collapsed && (
                    <div className="flex flex-1 items-center gap-1.5 overflow-hidden pl-2">
                      <span className="flex-1 truncate text-left">{localizedLabel}</span>
                      {item === 'IT Service' && (
                        <span className="shrink-0 rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                          {t.navigation.active}
                        </span>
                      )}
                      {item === 'Timesheets' && (
                        <span className="shrink-0 rounded-full bg-slate-500/15 px-1.5 py-0.5 text-sm font-bold text-slate-700 dark:text-slate-300">
                          6
                        </span>
                      )}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="shrink-0 space-y-1 border-t border-sidebar-border px-3 py-2">
        <button
          type="button"
          aria-label={t.navigation.helpSupport}
          className="flex h-9 w-full items-center rounded-lg px-2 text-xs text-muted transition-colors hover:bg-surface-subtle hover:text-foreground"
        >
          <span className="grid h-8 w-8 shrink-0 place-items-center">
            <HelpCircle size={16} className="h-4 w-4 shrink-0" />
          </span>
          {!collapsed && <span className="truncate pl-2">{t.navigation.helpSupport}</span>}
        </button>
        <div className="flex h-9 items-center rounded-lg px-2 text-foreground">
          <span className="grid h-8 w-8 shrink-0 place-items-center">
            <Avatar className="h-8 w-8 shrink-0 text-sm" />
          </span>
          {!collapsed && (
            <div className="flex flex-1 items-center gap-1.5 overflow-hidden pl-2">
              <div className="-my-1 flex min-w-0 flex-1 flex-col">
                <strong className="truncate text-xs font-semibold leading-tight">Nadia Le</strong>
                <small className="truncate text-sm text-muted">Operations Manager</small>
              </div>
              <MoreHorizontal size={14} className="shrink-0 text-muted" />
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

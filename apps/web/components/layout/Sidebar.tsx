import React from 'react';
import { ChevronDown, ChevronLeft, HelpCircle, MoreHorizontal } from 'lucide-react';
import { Page } from '@/lib/types/navigation';
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
  setPage: (p: Page) => void;
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
}) {
  const { t } = useTranslation();

  const choose = (item: Page) => {
    setPage(item);
    setMobileOpen(false);
  };

  return (
    <aside
      className={cn(
        'fixed bottom-0 left-0 top-0 z-30 flex select-none flex-col border-r border-sidebar-border bg-sidebar-bg transition-all duration-200',
        collapsed ? 'w-[72px]' : 'w-[240px]',
        mobileOpen ? '!w-[270px] translate-x-0' : 'max-md:-translate-x-full',
      )}
    >
      {/* Brand Header */}
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-sidebar-border px-4">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary text-sm font-black text-primary-foreground shadow-sm">
            C
          </span>
          {!collapsed && (
            <div className="flex min-w-0 flex-col">
              <strong className="truncate text-sm font-bold leading-tight text-foreground">
                CompanyLab
              </strong>
              <small className="truncate text-sm text-muted">
                {t.navigation.operationsWorkspace}
              </small>
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          className="hidden !p-3 text-muted hover:text-foreground md:inline-flex"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? t.navigation.expandSidebar : t.navigation.collapseSidebar}
        >
          <ChevronLeft
            className={cn('h-4 w-4 transition-transform duration-200', collapsed && 'rotate-180')}
          />
        </Button>
      </div>

      {/* Role Switcher */}
      <div
        className={cn(
          'shadow-xs mx-2.5 my-3 flex shrink-0 items-center gap-2 rounded-lg border border-border bg-surface p-2 text-foreground',
          collapsed && 'justify-center',
        )}
      >
        <Avatar initials="CL" className="h-7 w-7 text-sm" />
        {!collapsed && (
          <>
            <div className="flex min-w-0 flex-1 flex-col">
              <strong className="truncate text-xs font-semibold leading-tight">CompanyLab</strong>
              <small className="truncate text-sm text-muted">
                {t.navigation.operationsWorkspace}
              </small>
            </div>
            <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted" />
          </>
        )}
      </div>

      {/* Navigation Links */}
      <nav
        className="flex-1 space-y-4 overflow-y-auto px-2 py-1"
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

              return (
                <button
                  type="button"
                  key={item}
                  onClick={() => choose(item)}
                  aria-label={localizedLabel}
                  className={cn(
                    'flex h-9 w-full items-center gap-2.5 rounded-lg px-2.5 text-xs font-medium transition-colors',
                    collapsed && 'justify-center px-0',
                    active
                      ? 'shadow-xs bg-sidebar-active font-semibold text-sidebar-activeFg'
                      : 'text-muted hover:bg-surface-subtle hover:text-foreground',
                  )}
                  title={collapsed ? localizedLabel : undefined}
                >
                  <Icon name={item} size={16} />
                  {!collapsed && (
                    <>
                      <span className="flex-1 truncate text-left">{localizedLabel}</span>
                      {item === 'IT Service' && (
                        <span className="rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                          {t.navigation.active}
                        </span>
                      )}
                      {item === 'Timesheets' && (
                        <span className="rounded-full bg-slate-500/15 px-1.5 py-0.5 text-sm font-bold text-slate-700 dark:text-slate-300">
                          6
                        </span>
                      )}
                    </>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="shrink-0 space-y-1 border-t border-sidebar-border p-2">
        <button
          type="button"
          aria-label={t.navigation.helpSupport}
          className={`flex h-8 w-full items-center gap-2 rounded-lg px-2 text-xs text-muted transition hover:bg-surface-subtle hover:text-foreground ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <HelpCircle size={15} />
          {!collapsed && <span>{t.navigation.helpSupport}</span>}
        </button>
        <div
          className={`flex items-center gap-2.5 rounded-lg p-1.5 text-foreground ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <Avatar className="h-7 w-7 text-sm" />
          {!collapsed && (
            <>
              <div className="flex min-w-0 flex-1 flex-col">
                <strong className="truncate text-xs font-semibold leading-tight">Nadia Le</strong>
                <small className="truncate text-sm text-muted">Operations Manager</small>
              </div>
              <MoreHorizontal size={14} className="text-muted" />
            </>
          )}
        </div>
      </div>
    </aside>
  );
}

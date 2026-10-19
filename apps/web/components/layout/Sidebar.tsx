import React from 'react';
import { ChevronDown, ChevronLeft, HelpCircle, MoreHorizontal } from 'lucide-react';
import { Page } from '@/lib/types/navigation';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Icon } from '@/components/ui/icon';

export const navGroups = [
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
  const choose = (item: Page) => {
    setPage(item);
    setMobileOpen(false);
  };

  return (
    <aside
      className={`fixed top-0 bottom-0 left-0 z-30 flex flex-col bg-sidebar-bg border-r border-sidebar-border transition-all duration-200 select-none ${
        collapsed ? 'w-[72px]' : 'w-[240px]'
      } ${mobileOpen ? 'translate-x-0 !w-[270px]' : 'max-md:-translate-x-full'}`}
    >
      {/* Brand Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-sidebar-border shrink-0">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <span className="w-8 h-8 rounded-lg bg-primary text-primary-foreground font-black grid place-items-center text-sm shrink-0 shadow-sm">
            C
          </span>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <strong className="text-sm font-bold text-foreground truncate leading-tight">
                CompanyLab
              </strong>
              <small className="text-[11px] text-muted truncate">Operations workspace</small>
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          className="!p-3 text-muted hover:text-foreground hidden md:inline-flex"
          onClick={() => setCollapsed(!collapsed)}
        >
          <ChevronLeft
            className={`w-4 h-4 transition-transform duration-200 ${collapsed ? 'rotate-180' : ''}`}
          />
        </Button>
      </div>

      {/* Role Switcher */}
      <div
        className={`mx-2.5 my-3 p-2 bg-surface border border-border rounded-lg flex items-center gap-2 text-foreground shadow-xs shrink-0 ${collapsed ? 'justify-center p-2' : ''}`}
      >
        <Avatar initials="CL" className="w-7 h-7 text-[10px]" />
        {!collapsed && (
          <>
            <div className="flex flex-col min-w-0 flex-1">
              <strong className="text-xs font-semibold truncate leading-tight">CompanyLab</strong>
              <small className="text-[10px] text-muted truncate">Operations</small>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-muted shrink-0" />
          </>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-2 space-y-4 py-1">
        {navGroups.map((group) => (
          <div key={group.label || 'main'} className="space-y-0.5">
            {group.label && !collapsed && (
              <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-2 py-1">
                {group.label}
              </span>
            )}
            {group.items.map((item) => {
              const active = page === item;
              return (
                <button
                  key={item}
                  onClick={() => choose(item)}
                  className={`w-full h-9 rounded-lg flex items-center gap-2.5 px-2.5 text-xs font-medium transition-colors ${
                    collapsed ? 'justify-center px-0' : ''
                  } ${
                    active
                      ? 'bg-sidebar-active text-sidebar-activeFg font-semibold shadow-xs'
                      : 'text-muted hover:bg-surface-subtle hover:text-foreground'
                  }`}
                  title={collapsed ? item : undefined}
                >
                  <Icon name={item} size={16} />
                  {!collapsed && (
                    <>
                      <span className="truncate flex-1 text-left">{item}</span>
                      {item === 'IT Service' && (
                        <span className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded-full">
                          Active
                        </span>
                      )}
                      {item === 'Timesheets' && (
                        <span className="text-[10px] font-bold bg-muted/15 text-muted px-1.5 py-0.5 rounded-full">
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
      <div className="p-2 border-t border-sidebar-border shrink-0 space-y-1">
        <button
          className={`w-full h-8 rounded-lg flex items-center gap-2 px-2 text-xs text-muted hover:text-foreground hover:bg-surface-subtle transition ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <HelpCircle size={15} />
          {!collapsed && <span>Help & support</span>}
        </button>
        <div
          className={`flex items-center gap-2.5 p-1.5 rounded-lg text-foreground ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <Avatar className="w-7 h-7 text-[10px]" />
          {!collapsed && (
            <>
              <div className="flex flex-col min-w-0 flex-1">
                <strong className="text-xs font-semibold leading-tight truncate">Nadia Le</strong>
                <small className="text-[10px] text-muted truncate">Operations Manager</small>
              </div>
              <MoreHorizontal size={14} className="text-muted" />
            </>
          )}
        </div>
      </div>
    </aside>
  );
}

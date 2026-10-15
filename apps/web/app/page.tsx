'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  BarChart3,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  DatabaseBackup,
  FolderKanban,
  HelpCircle,
  LayoutDashboard,
  ListChecks,
  Menu,
  MonitorCog,
  Moon,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  Settings,
  ShieldAlert,
  Sun,
  TrendingUp,
  Users,
  WalletCards,
  X,
  type LucideIcon,
} from 'lucide-react';
import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { ServiceRequestItem } from '@companylab/contracts';
import { fetchDashboardStats, fetchRequests, fetchRequestDetail } from '@/lib/api-client';
import { MetricCards } from '@/components/dashboard/MetricCards';
import { RequestFilters } from '@/components/requests/RequestFilters';
import { RequestTable } from '@/components/requests/RequestTable';
import { RequestTimeline } from '@/components/requests/RequestTimeline';

type Page =
  | 'Overview'
  | 'IT Service'
  | 'Projects'
  | 'People'
  | 'Data & Migration'
  | 'My Work'
  | 'Sales'
  | 'Resources'
  | 'Timesheets'
  | 'Finance'
  | 'Reports'
  | 'Settings';

const icons: Record<string, LucideIcon> = {
  Overview: LayoutDashboard,
  Projects: FolderKanban,
  People: Users,
  Sales: TrendingUp,
  Resources: BarChart3,
  Timesheets: Clock3,
  Finance: WalletCards,
  'IT Service': MonitorCog,
  Reports: BarChart3,
  'Data & Migration': DatabaseBackup,
  Settings,
  'My Work': ListChecks,
  Project: BriefcaseBusiness,
  plus: Plus,
};

function Icon({
  name,
  size = 18,
  className = '',
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const IconComponent = icons[name] ?? Plus;
  return <IconComponent size={size} strokeWidth={1.8} aria-hidden="true" className={className} />;
}

function Button({
  children,
  variant = 'primary',
  onClick,
  disabled = false,
  className = '',
  type = 'button',
  title,
}: {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit';
  title?: string;
}) {
  const base =
    'inline-flex items-center justify-center font-medium text-xs rounded-lg transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer gap-1.5 shrink-0 select-none';
  const variants = {
    primary:
      'bg-primary text-primary-foreground hover:bg-primary-hover px-3 py-1.5 shadow-sm active:scale-[0.98]',
    secondary:
      'bg-surface text-foreground hover:bg-surface-subtle border border-border px-3 py-1.5 shadow-xs active:scale-[0.98]',
    ghost: 'text-muted hover:text-foreground hover:bg-surface-subtle p-1.5',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 shadow-sm active:scale-[0.98]',
  };
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      title={title}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

function Badge({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: string }) {
  const neutralTone = {
    bg: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border border-slate-500/20',
    dot: 'bg-slate-400',
  };
  const tones: Record<string, { bg: string; dot: string }> = {
    success: {
      bg: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20',
      dot: 'bg-emerald-500',
    },
    warning: {
      bg: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20',
      dot: 'bg-amber-500',
    },
    danger: {
      bg: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20',
      dot: 'bg-rose-500',
    },
    info: {
      bg: 'bg-sky-500/10 text-sky-700 dark:text-sky-400 border border-sky-500/20',
      dot: 'bg-sky-500',
    },
    neutral: neutralTone,
  };
  const t = tone && tones[tone] ? tones[tone]! : neutralTone;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium ${t.bg}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${t.dot}`} />
      {children}
    </span>
  );
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <section
      className={`bg-surface border border-border rounded-xl shadow-[var(--card-shadow)] text-foreground ${className}`}
    >
      {children}
    </section>
  );
}

function Avatar({ initials = 'NL', className = '' }: { initials?: string; className?: string }) {
  return (
    <span
      className={`w-7.5 h-7.5 shrink-0 rounded-full bg-blue-100 dark:bg-blue-950 text-primary font-bold text-[11px] inline-grid place-items-center ${className}`}
    >
      {initials}
    </span>
  );
}

const navGroups = [
  { label: '', items: ['Overview', 'My Work'] },
  {
    label: 'Business',
    items: ['IT Service', 'Projects', 'People', 'Resources', 'Timesheets', 'Finance', 'Sales'],
  },
  { label: 'Administration', items: ['Data & Migration', 'Reports', 'Settings'] },
];

function Sidebar({
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
  const choose = (item: string) => {
    setPage(item as Page);
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

const projects = [
  {
    code: 'PRJ-1042',
    name: 'Customer Portal',
    client: 'Northstar Systems',
    manager: 'Minh Tran',
    status: 'At risk',
    tone: 'warning',
    milestone: 'UAT sign-off',
    due: '16 Oct 2026',
    allocation: '92%',
    budget: '₫2.40B',
  },
  {
    code: 'PRJ-1038',
    name: 'Billing Platform',
    client: 'BluePeak Digital',
    manager: 'Sarah Nguyen',
    status: 'On track',
    tone: 'success',
    milestone: 'API integration',
    due: '21 Oct 2026',
    allocation: '76%',
    budget: '₫1.85B',
  },
  {
    code: 'PRJ-1031',
    name: 'Support Automation',
    client: 'Meridian Software',
    manager: 'Huy Pham',
    status: 'Blocked',
    tone: 'danger',
    milestone: 'Security review',
    due: '18 Oct 2026',
    allocation: '84%',
    budget: '₫1.20B',
  },
  {
    code: 'PRJ-1026',
    name: 'Analytics Workspace',
    client: 'HarborTech',
    manager: 'Linh Dao',
    status: 'On track',
    tone: 'success',
    milestone: 'Data validation',
    due: '28 Oct 2026',
    allocation: '68%',
    budget: '₫980M',
  },
  {
    code: 'PRJ-1019',
    name: 'Partner Console',
    client: 'Orchid Labs',
    manager: 'Minh Tran',
    status: 'Planning',
    tone: 'info',
    milestone: 'Kickoff',
    due: '4 Nov 2026',
    allocation: '42%',
    budget: '₫760M',
  },
];

function Topbar({
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
    <header className="h-14 bg-surface border-b border-border px-4 flex items-center justify-between sticky top-0 z-20 shrink-0">
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

      <div className="flex items-center gap-1">
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
          <Plus size={15} /> <span className="hidden sm:inline">Create</span>
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

function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl font-bold tracking-tight text-foreground">{title}</h1>
          {title === 'Operations Overview' && <Badge tone="info">Demo workspace</Badge>}
        </div>
        <p className="text-xs text-muted mt-0.5">{subtitle}</p>
      </div>
      {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
    </div>
  );
}

function Kpi({
  label,
  value,
  detail,
  tone,
  icon,
  onClick,
}: {
  label: string;
  value: string;
  detail: string;
  tone: string;
  icon: string;
  onClick?: () => void;
}) {
  const toneMap: Record<string, string> = {
    warning: 'text-amber-600 dark:text-amber-400 bg-amber-500/10',
    success: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10',
    danger: 'text-rose-600 dark:text-rose-400 bg-rose-500/10',
    info: 'text-sky-600 dark:text-sky-400 bg-sky-500/10',
  };
  return (
    <Card
      className={`p-4 flex flex-col justify-between gap-3 ${onClick ? 'cursor-pointer hover:border-primary/50 transition' : ''}`}
    >
      <div className="flex items-center justify-between" onClick={onClick}>
        <span className="text-xs font-medium text-muted">{label}</span>
        <span
          className={`w-7 h-7 rounded-lg grid place-items-center ${toneMap[tone] || toneMap.info}`}
        >
          <Icon name={icon} size={15} />
        </span>
      </div>
      <strong className="text-2xl font-bold text-foreground tracking-tight" onClick={onClick}>
        {value}
      </strong>
      <span className="text-xs flex items-center gap-1.5 text-muted">
        <span
          className={`w-1.5 h-1.5 rounded-full ${tone === 'danger' ? 'bg-rose-500' : tone === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'}`}
        />
        {detail}
      </span>
    </Card>
  );
}

function ProjectTable({
  full = false,
  query = '',
  onRow,
}: {
  full?: boolean;
  query?: string;
  onRow: (p: (typeof projects)[0]) => void;
}) {
  const rows = projects.filter((p) =>
    `${p.name} ${p.client} ${p.manager}`.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <div className="overflow-x-auto w-full">
      <table className="w-full text-left text-xs">
        <thead className="bg-surface-subtle text-muted uppercase text-[10px] font-semibold border-b border-border">
          <tr>
            {full && (
              <th className="py-2.5 px-3">
                <input type="checkbox" aria-label="Select all" className="rounded" />
              </th>
            )}
            {full && <th className="py-2.5 px-3">Project code</th>}
            <th className="py-2.5 px-3">Project / client</th>
            <th className="py-2.5 px-3">Project manager</th>
            <th className="py-2.5 px-3">Status</th>
            {!full && <th className="py-2.5 px-3">Next milestone</th>}
            <th className="py-2.5 px-3">Target date</th>
            {full && <th className="py-2.5 px-3 text-right">Budget</th>}
            <th className="py-2.5 px-3 text-right">Allocation</th>
            <th className="py-2.5 px-3 text-right">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((p) => (
            <tr
              key={p.code}
              onClick={() => onRow(p)}
              className="hover:bg-surface-subtle cursor-pointer transition"
            >
              {full && (
                <td className="py-2.5 px-3">
                  <input
                    type="checkbox"
                    aria-label={`Select ${p.name}`}
                    onClick={(e) => e.stopPropagation()}
                    className="rounded"
                  />
                </td>
              )}
              {full && <td className="py-2.5 px-3 font-mono text-muted">{p.code}</td>}
              <td className="py-2.5 px-3">
                <div className="font-medium text-foreground hover:text-primary transition">
                  {p.name}
                </div>
                <div className="text-[11px] text-muted">{p.client}</div>
              </td>
              <td className="py-2.5 px-3">
                <div className="flex items-center gap-2">
                  <Avatar
                    initials={p.manager
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                    className="w-6 h-6 text-[10px]"
                  />
                  <span>{p.manager}</span>
                </div>
              </td>
              <td className="py-2.5 px-3">
                <Badge tone={p.tone}>{p.status}</Badge>
              </td>
              {!full && <td className="py-2.5 px-3 text-muted">{p.milestone}</td>}
              <td className="py-2.5 px-3 text-muted">{p.due}</td>
              {full && <td className="py-2.5 px-3 text-right font-medium">{p.budget}</td>}
              <td className="py-2.5 px-3 text-right font-semibold">{p.allocation}</td>
              <td className="py-2.5 px-3 text-right">
                <Button variant="ghost" className="p-1">
                  <MoreHorizontal size={14} />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && (
        <div className="text-center py-12 text-muted space-y-2">
          <Search className="w-8 h-8 mx-auto text-muted-foreground opacity-50" />
          <strong className="block text-foreground text-sm">No projects found</strong>
          <p className="text-xs">Try changing your search or removing a filter.</p>
          <Button variant="secondary" className="mt-2">
            Clear filters
          </Button>
        </div>
      )}
    </div>
  );
}

function Overview({
  onProject,
  setPage,
  toast,
}: {
  onProject: (p: (typeof projects)[0]) => void;
  setPage: (p: Page) => void;
  toast: (s: string) => void;
}) {
  const approvals = [
    ['Timesheets', '6 awaiting approval', 'Anh Do + 5 others', '2 days', 'High'],
    ['Leave requests', '3 awaiting approval', 'Mai Vu + 2 others', '4 hours', 'Normal'],
    ['Resource requests', '2 awaiting approval', 'Project Delivery', '1 day', 'High'],
    ['Equipment purchase', '1 awaiting approval', 'Tuan Ho', '3 days', 'Normal'],
  ];
  return (
    <div className="space-y-4">
      <PageHeader
        title="Operations Overview"
        subtitle="Wednesday, 14 October 2026"
        actions={
          <>
            <Button variant="secondary">Last 30 days ⌄</Button>
            <Button variant="secondary">All departments ⌄</Button>
            <Button variant="secondary" onClick={() => toast('Report exported successfully')}>
              ⇩ Export report
            </Button>
            <Button variant="ghost">
              <MoreHorizontal size={15} />
            </Button>
          </>
        }
      />

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <Kpi
          label="Active projects"
          value="12"
          detail="3 at risk"
          tone="warning"
          icon="Projects"
          onClick={() => setPage('Projects')}
        />
        <Kpi
          label="Resource allocation"
          value="78%"
          detail="8 people available"
          tone="success"
          icon="Resources"
        />
        <Kpi
          label="Outstanding receivables"
          value="₫1.24B"
          detail="₫320M overdue"
          tone="danger"
          icon="Finance"
        />
        <Kpi
          label="Open IT tickets"
          value="18"
          detail="4 approaching SLA"
          tone="warning"
          icon="IT Service"
          onClick={() => setPage('IT Service')}
        />
      </div>

      <p className="text-xs text-muted">
        <b>Resource allocation</b> = planned allocated hours ÷ available working hours. This is not
        billable utilization.
      </p>

      {/* Upper Grid: Attention & Approval Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Projects Attention */}
        <Card className="lg:col-span-2 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-foreground">Projects requiring attention</h2>
              <p className="text-xs text-muted">
                Projects with upcoming milestones or delivery risks
              </p>
            </div>
            <Button variant="secondary" onClick={() => setPage('Projects')}>
              View all projects
            </Button>
          </div>
          <ProjectTable onRow={onProject} />
        </Card>

        {/* Approval Queue */}
        <Card className="p-4 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-border mb-3">
            <div>
              <h2 className="text-sm font-bold text-foreground">My approval queue</h2>
              <p className="text-xs text-muted">12 requests require your review</p>
            </div>
            <Button variant="ghost">View all</Button>
          </div>
          <div className="space-y-3 flex-1">
            {approvals.map((a, i) => (
              <div
                key={a[0]}
                className="flex items-start justify-between gap-3 p-2.5 rounded-lg border border-border/60 hover:bg-surface-subtle transition"
              >
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary grid place-items-center shrink-0 mt-0.5">
                    <Icon
                      name={
                        i === 0
                          ? 'Timesheets'
                          : i === 2
                            ? 'Resources'
                            : i === 3
                              ? 'IT Service'
                              : 'People'
                      }
                      size={15}
                    />
                  </div>
                  <div>
                    <strong className="block text-xs font-semibold text-foreground">{a[0]}</strong>
                    <span className="block text-xs text-muted">{a[1]}</span>
                    <small className="text-[10px] text-muted-foreground">
                      {a[2]} · {a[3]} ago
                    </small>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <Badge tone={a[4] === 'High' ? 'warning' : 'neutral'}>{a[4]}</Badge>
                  <Button
                    variant="secondary"
                    className="text-[10px] px-2 py-1"
                    onClick={() => {
                      if (a[0] === 'Equipment purchase') {
                        setPage('IT Service');
                      } else {
                        toast(`${a[0]} opened for review`);
                      }
                    }}
                  >
                    Review
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Lower Grid: Capacity, Activity, Sync */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Capacity */}
        <Card className="p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-border mb-3">
            <div>
              <h2 className="text-sm font-bold text-foreground">
                Resource allocation by department
              </h2>
              <p className="text-xs text-muted">Capacity for 12–31 October</p>
            </div>
            <Badge tone="info">Updated 8 min ago</Badge>
          </div>
          <div className="space-y-3">
            {[
              ['Engineering', 84, '6 available'],
              ['Quality assurance', 92, '2 overallocated'],
              ['Product & design', 71, '3 available'],
              ['Project management', 76, '2 available'],
            ].map((d, i) => (
              <div key={d[0]} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <strong className="text-foreground">{d[0]}</strong>
                  <span className={i === 1 ? 'text-rose-600 font-bold' : 'text-muted'}>
                    {d[1]}% ({d[2]})
                  </span>
                </div>
                <div className="h-2 w-full bg-surface-subtle border border-border rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${i === 1 ? 'bg-rose-500' : 'bg-primary'}`}
                    style={{ width: `${d[1]}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Activity */}
        <Card className="p-4 flex flex-col justify-between">
          <div className="pb-3 border-b border-border mb-3">
            <h2 className="text-sm font-bold text-foreground">Recent activity</h2>
            <p className="text-xs text-muted">Across your workspace</p>
          </div>
          <div className="space-y-3">
            {[
              ['Contract signed', 'Northstar Systems · ₫2.40B contract value', '18 min'],
              ['Employee onboarded', 'Bao Nguyen joined Engineering', '2 hr'],
              ['Milestone accepted', 'BluePeak API integration', '4 hr'],
              ['Payment recorded', '₫460M cash received · INV-2084', 'Yesterday'],
            ].map((a) => (
              <div key={a[0]} className="flex items-start gap-2.5 text-xs">
                <span className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                <div className="flex-1">
                  <strong className="block text-foreground leading-tight">{a[0]}</strong>
                  <small className="text-muted text-[11px]">{a[1]}</small>
                </div>
                <time className="text-muted-foreground text-[10px] shrink-0">{a[2]}</time>
              </div>
            ))}
          </div>
        </Card>

        {/* Google Sheets Sync */}
        <Card className="p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between pb-3 border-b border-border mb-3">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold grid place-items-center text-xs">
                  S
                </span>
                <div>
                  <h2 className="text-sm font-bold text-foreground">Google Sheets sync</h2>
                  <p className="text-xs text-muted">Last sync: Today, 09:42</p>
                </div>
              </div>
              <Badge tone="warning">2 issues</Badge>
            </div>
            <div className="p-3 bg-surface-subtle border border-border rounded-lg space-y-1 mb-3 text-xs">
              <div className="flex justify-between">
                <span className="text-muted">Processed</span>
                <b className="text-foreground">2,418 records</b>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Quarantine / Failed</span>
                <b className="text-rose-600 font-bold">3 records</b>
              </div>
            </div>
          </div>
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => setPage('Data & Migration')}
          >
            Review sync issues
          </Button>
        </Card>
      </div>
    </div>
  );
}

function Projects({ onProject }: { onProject: (p: (typeof projects)[0]) => void }) {
  const [query, setQuery] = useState('');
  const [view, setView] = useState('All projects');
  return (
    <div className="space-y-4">
      <PageHeader
        title="Projects"
        subtitle="12 active projects across 8 clients"
        actions={
          <Button>
            <Plus size={14} /> Create project
          </Button>
        }
      />
      <div className="flex items-center gap-4 border-b border-border overflow-x-auto text-xs font-semibold">
        {['All projects', 'My projects', 'At risk', 'Archived'].map((v) => (
          <button
            key={v}
            className={`py-2 border-b-2 transition whitespace-nowrap ${
              view === v
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-muted hover:text-foreground'
            }`}
            onClick={() => setView(v)}
          >
            {v}{' '}
            {v === 'All projects' && (
              <span className="text-[10px] bg-muted/15 px-1.5 py-0.5 rounded-full ml-1">12</span>
            )}
          </button>
        ))}
      </div>
      <Card className="overflow-hidden">
        <div className="p-3 border-b border-border flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 px-2.5 h-8 bg-surface-subtle border border-border rounded-lg w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search projects..."
              className="bg-transparent border-0 outline-none text-xs text-foreground placeholder:text-muted w-full"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary">Status ⌄</Button>
            <Button variant="secondary">Client ⌄</Button>
            <Button variant="secondary">Manager ⌄</Button>
            <Button variant="secondary">Department ⌄</Button>
          </div>
        </div>
        <ProjectTable full query={query} onRow={onProject} />
        <div className="p-3 border-t border-border flex items-center justify-between text-xs text-muted">
          <span>Showing 1–5 of 12 projects</span>
          <div className="flex items-center gap-1">
            <Button variant="secondary" disabled className="w-7 h-7 p-0">
              <ChevronLeft size={13} />
            </Button>
            <Button
              variant="secondary"
              className="w-7 h-7 p-0 font-bold bg-primary text-primary-foreground"
            >
              1
            </Button>
            <Button variant="secondary" className="w-7 h-7 p-0">
              2
            </Button>
            <Button variant="secondary" className="w-7 h-7 p-0">
              3
            </Button>
            <Button variant="secondary" className="w-7 h-7 p-0">
              <ChevronRight size={13} />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

function ProjectDetail({ project, close }: { project: (typeof projects)[0]; close: () => void }) {
  return (
    <div className="space-y-4">
      <Button
        variant="ghost"
        onClick={close}
        className="text-primary hover:text-primary-hover -ml-2"
      >
        <ChevronLeft size={16} /> Back to projects
      </Button>
      <PageHeader
        title={project.name}
        subtitle={`${project.code} · ${project.client}`}
        actions={
          <>
            <Badge tone={project.tone}>{project.status}</Badge>
            <Button variant="secondary">Edit project</Button>
            <Button variant="ghost">
              <MoreHorizontal size={15} />
            </Button>
          </>
        }
      />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-surface border border-border rounded-xl">
        <div>
          <small className="block text-[10px] uppercase font-bold text-muted">
            PROJECT MANAGER
          </small>
          <b className="text-xs font-semibold text-foreground">{project.manager}</b>
        </div>
        <div>
          <small className="block text-[10px] uppercase font-bold text-muted">CONTRACT REF</small>
          <b className="text-xs font-semibold text-foreground">CTR-2026-041</b>
        </div>
        <div>
          <small className="block text-[10px] uppercase font-bold text-muted">TARGET DATE</small>
          <b className="text-xs font-semibold text-foreground">{project.due}</b>
        </div>
        <div>
          <small className="block text-[10px] uppercase font-bold text-muted">BUDGET</small>
          <b className="text-xs font-semibold text-foreground">{project.budget}</b>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 p-4 space-y-3">
          <h2 className="text-sm font-bold text-foreground">Delivery health</h2>
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs space-y-1">
            <Badge tone="warning">Risk</Badge>
            <strong className="block text-foreground mt-1">UAT completion is behind plan</strong>
            <p className="text-muted">
              Client testers have completed 68% of test cases. Two critical workflows remain
              unverified.
            </p>
            <span className="text-[10px] text-muted-foreground block">
              Owner: {project.manager} · Review by 16 Oct
            </span>
          </div>
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-xs space-y-1">
            <Badge tone="danger">Blocker</Badge>
            <strong className="block text-foreground mt-1">Production credentials pending</strong>
            <p className="text-muted">
              Client security team approval is required before deployment rehearsal.
            </p>
            <span className="text-[10px] text-muted-foreground block">
              Owner: Northstar IT · Due 15 Oct
            </span>
          </div>
        </Card>
        <Card className="p-4 space-y-3">
          <h2 className="text-sm font-bold text-foreground">Financial summary</h2>
          <div className="space-y-2 text-xs">
            {[
              ['Contract value', project.budget],
              ['Recognized revenue', '₫1.42B'],
              ['Invoiced amount', '₫1.18B'],
              ['Cash received', '₫720M'],
            ].map((x) => (
              <div key={x[0]} className="flex justify-between py-1 border-b border-border">
                <span className="text-muted">{x[0]}</span>
                <b className="font-mono text-foreground">{x[1]}</b>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function People({ toast }: { toast: (s: string) => void }) {
  const [task, setTask] = useState<string | null>(null);
  const groups = [
    [
      'Human Resources',
      [
        ['Verify employment documents', 'Linh Ho', '12 Oct', 'Complete'],
        ['Add payroll profile', 'Linh Ho', '13 Oct', 'Complete'],
      ],
    ],
    [
      'Internal IT',
      [
        ['Assign laptop and accessories', 'Quang Pham', '14 Oct', 'In progress'],
        ['Provision workspace accounts', 'System simulation', '14 Oct', 'Pending'],
      ],
    ],
    [
      'Hiring Manager',
      [
        ['Assign onboarding buddy', 'Minh Tran', '15 Oct', 'Complete'],
        ['Confirm initial project allocation', 'Minh Tran', '16 Oct', 'Pending'],
      ],
    ],
  ];
  return (
    <div className="space-y-4">
      <PageHeader
        title="Employee onboarding"
        subtitle="Cross-department workflow · ONB-2026-038"
        actions={<Button variant="secondary">Workflow settings</Button>}
      />
      <Card className="p-4 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-1">
          <Avatar initials="BN" className="w-10 h-10 text-xs" />
          <div>
            <h2 className="text-sm font-bold text-foreground">Bao Nguyen</h2>
            <p className="text-xs text-muted">Software Engineer · Engineering</p>
          </div>
        </div>
        <div className="flex items-center gap-6 text-xs">
          <span>
            <small className="block text-muted text-[10px]">MANAGER</small>
            <b>Minh Tran</b>
          </span>
          <span>
            <small className="block text-muted text-[10px]">START DATE</small>
            <b>19 Oct 2026</b>
          </span>
          <span>
            <small className="block text-muted text-[10px]">EMPLOYMENT</small>
            <b>Full-time</b>
          </span>
        </div>
        <Badge tone="info">Onboarding</Badge>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Checklist */}
        <Card className="lg:col-span-2 p-4">
          <h2 className="text-sm font-bold text-foreground mb-3">
            Onboarding checklist (5 of 8 tasks complete)
          </h2>
          <div className="space-y-4">
            {groups.map((g) => (
              <div key={g[0] as string} className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {g[0] as string}
                </h3>
                <div className="space-y-1">
                  {(g[1] as string[][]).map((t) => (
                    <button
                      key={t[0]}
                      onClick={() => setTask(t[0] ?? null)}
                      className="w-full flex items-center justify-between p-2.5 rounded-lg border border-border hover:bg-surface-subtle transition text-left text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`w-4 h-4 rounded grid place-items-center text-[10px] ${t[3] === 'Complete' ? 'bg-emerald-500 text-white' : 'border border-border'}`}
                        >
                          {t[3] === 'Complete' && <Check size={11} />}
                        </span>
                        <div>
                          <b className="text-foreground">{t[0]}</b>
                          <small className="block text-muted text-[11px]">
                            Owner: {t[1]} · Due {t[2]}
                          </small>
                        </div>
                      </div>
                      <Badge
                        tone={
                          t[3] === 'Complete'
                            ? 'success'
                            : t[3] === 'In progress'
                              ? 'info'
                              : 'neutral'
                        }
                      >
                        {t[3]}
                      </Badge>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Equipment & Access */}
        <Card className="p-4 space-y-4">
          <h2 className="text-sm font-bold text-foreground">Equipment & access</h2>
          <div className="p-3 border border-border rounded-lg flex items-center justify-between">
            <div>
              <strong className="block text-xs text-foreground">MacBook Pro 14-inch</strong>
              <small className="text-muted text-[11px]">Asset CL-MBP-0284 · Assigned</small>
            </div>
            <Badge tone="success">Ready</Badge>
          </div>
          <div className="space-y-2 text-xs">
            {['Google Workspace', 'GitHub Enterprise', 'Slack workspace'].map((x, i) => (
              <div key={x} className="flex justify-between py-1.5 border-b border-border">
                <span className="text-muted">{x}</span>
                <Badge tone={i === 0 ? 'success' : 'warning'}>
                  {i === 0 ? 'Active' : 'Queued'}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Task Drawer Modal */}
      {task && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex justify-end"
          onClick={() => setTask(null)}
        >
          <aside
            className="w-full max-w-md bg-surface border-l border-border h-full p-6 flex flex-col justify-between shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h2 className="text-base font-bold text-foreground">{task}</h2>
                <Button variant="ghost" onClick={() => setTask(null)}>
                  <X size={16} />
                </Button>
              </div>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-muted mb-1">Task owner</label>
                  <input
                    defaultValue="Quang Pham"
                    className="w-full h-8 px-2.5 rounded-lg bg-surface-subtle border border-border text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-muted mb-1">Due date</label>
                  <input
                    defaultValue="14 Oct 2026"
                    className="w-full h-8 px-2.5 rounded-lg bg-surface-subtle border border-border text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-muted mb-1">Status</label>
                  <select
                    defaultValue="In progress"
                    className="w-full h-8 px-2.5 rounded-lg bg-surface-subtle border border-border text-foreground"
                  >
                    <option>Pending</option>
                    <option>In progress</option>
                    <option>Complete</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t border-border">
              <Button variant="secondary" onClick={() => setTask(null)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setTask(null);
                  toast('Task updated successfully');
                }}
              >
                Save changes
              </Button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

function Migration({
  toast,
  refetchQueries,
}: {
  toast: (s: string) => void;
  refetchQueries: () => void;
}) {
  const [tab, setTab] = useState('Sources');
  const sources = [
    [
      'IT Asset & Operations',
      'IT Support',
      'Google Sheets',
      'Nguyen Anh Tuong',
      'Google Sheets (Phase A)',
      'Sheets → ERP',
      'Realtime / API',
      'Healthy',
    ],
    [
      'Sales Master',
      'Sales',
      'Google Sheets',
      'Thu Nguyen',
      'Google Sheets',
      'Sheets → ERP',
      'Today, 09:42',
      'Healthy',
    ],
    [
      'Employee Directory',
      'HR',
      'Google Sheets',
      'Linh Ho',
      'ERP',
      'Sheets → ERP',
      'Today, 09:40',
      'Review',
    ],
    [
      'Project Tracker',
      'Delivery',
      'Google Sheets',
      'Minh Tran',
      'ERP',
      'Sheets → ERP',
      'Today, 09:38',
      'Healthy',
    ],
    [
      'Invoice Register',
      'Finance',
      'Google Sheets',
      'Mai Pham',
      'Google Sheets',
      'Sheets → ERP',
      'Yesterday, 18:15',
      'Partial failure',
    ],
  ];
  return (
    <div className="space-y-4">
      <PageHeader
        title="Data & Migration"
        subtitle="Controlled migration from Google Sheets to CompanyLab ERP (ADR-0001, ADR-0002)"
        actions={
          <>
            <Button variant="secondary">Migration settings</Button>
            <Button
              onClick={() => {
                refetchQueries();
                toast('Sync started with Google Sheets. You can continue working.');
              }}
            >
              Run sync
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {[
          ['Connected sources', '5', '4 healthy'],
          ['Last sync run', '09:42', 'Phase A Shadow Run'],
          ['Records requiring review', '3', 'Quarantined'],
          ['Migration phase', 'Phase 2', 'Parallel validation'],
        ].map((x, i) => (
          <Card key={x[0]} className="p-4 flex flex-col gap-2">
            <span className="text-xs text-muted">{x[0]}</span>
            <strong className="text-xl font-bold text-foreground">{x[1]}</strong>
            <Badge tone={i === 2 ? 'warning' : i === 3 ? 'info' : 'success'}>{x[2]}</Badge>
          </Card>
        ))}
      </div>

      <div className="flex items-center gap-4 border-b border-border overflow-x-auto text-xs font-semibold">
        {['Sources', 'Field Mapping', 'Sync Runs', 'Reconciliation', 'Cutover'].map((x) => (
          <button
            key={x}
            className={`py-2 border-b-2 transition whitespace-nowrap ${
              tab === x
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-muted hover:text-foreground'
            }`}
            onClick={() => setTab(x)}
          >
            {x}
          </button>
        ))}
      </div>

      {tab === 'Sources' ? (
        <Card className="overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-foreground">Connected sources</h2>
              <p className="text-xs text-muted">
                Ownership and sync direction are explicitly controlled per entity
              </p>
            </div>
            <Button variant="secondary">Connect source</Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-subtle text-muted text-[10px] uppercase font-semibold border-b border-border">
                <tr>
                  {[
                    'Source name',
                    'Department',
                    'Source type',
                    'Data owner',
                    'Source of truth',
                    'Sync direction',
                    'Last sync',
                    'Health',
                  ].map((x) => (
                    <th key={x} className="py-2.5 px-3">
                      {x}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {sources.map((s) => (
                  <tr key={s[0]} className="hover:bg-surface-subtle transition">
                    {s.map((x, i) => (
                      <td key={`${s[0]}-${i}`} className="py-2.5 px-3">
                        {i === 0 ? (
                          <span className="font-semibold text-primary">{x}</span>
                        ) : i === 4 ? (
                          <Badge tone="info">{x}</Badge>
                        ) : i === 7 ? (
                          <Badge tone={x === 'Healthy' ? 'success' : 'warning'}>{x}</Badge>
                        ) : (
                          <span className="text-muted">{x}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : tab === 'Reconciliation' ? (
        <Card className="p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h2 className="text-sm font-bold text-foreground">Reconciliation summary</h2>
              <p className="text-xs text-muted">
                Data copied is tracked separately from data verified
              </p>
            </div>
            <Badge tone="warning">Verification in progress</Badge>
          </div>
          <div className="space-y-2 text-xs">
            {[
              ['Employee records', '184', '184', 'Verified'],
              ['IT Assets & Laptops', '64', '64', 'Verified'],
              ['IT Service Requests', '118', '118', 'Verified'],
              ['Projects', '42', '42', 'Verified'],
              ['Invoice total', '₫8.42B', '₫8.42B', 'Needs review'],
              ['Missing references', '—', '3', 'Review'],
            ].map((x) => (
              <div key={x[0]} className="grid grid-cols-4 items-center py-2 border-b border-border">
                <b className="text-foreground">{x[0]}</b>
                <span className="text-muted">Source: {x[1]}</span>
                <span className="text-foreground">ERP: {x[2]}</span>
                <div className="text-right">
                  <Badge tone={x[3] === 'Verified' ? 'success' : 'warning'}>{x[3]}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : (
        <Card className="p-12 text-center space-y-2">
          <Check className="w-8 h-8 mx-auto text-primary" />
          <h2 className="text-sm font-bold text-foreground">{tab}</h2>
          <p className="text-xs text-muted max-w-md mx-auto">
            {tab === 'Cutover'
              ? 'Complete reconciliation and resolve 3 pending quarantined issues before ownership switches to ERP.'
              : 'Configuration is ready for administrator review.'}
          </p>
          <Button>{tab === 'Cutover' ? 'Review readiness' : 'Open configuration'}</Button>
        </Card>
      )}
    </div>
  );
}

function MyWork({ toast }: { toast: (s: string) => void }) {
  return (
    <div className="space-y-4 max-w-4xl">
      <PageHeader
        title="My Work"
        subtitle="Wednesday, 14 October"
        actions={<Avatar className="w-8 h-8" />}
      />
      <Card className="p-4 bg-primary text-primary-foreground border-none">
        <span className="text-xs opacity-80 block">Good morning, Nadia</span>
        <strong className="text-base font-bold">You have 4 items to complete today</strong>
      </Card>
      <div className="grid grid-cols-3 gap-3">
        {(
          [
            ['Submit timesheet', 'Timesheets'],
            ['Request leave', 'People'],
            ['Report IT issue', 'IT Service'],
          ] as const
        ).map(([actionName, iconName]) => (
          <button
            onClick={() => toast(`${actionName} opened`)}
            key={actionName}
            className="p-3 bg-surface border border-border rounded-xl text-center space-y-1 hover:border-primary transition"
          >
            <div className="w-7 h-7 mx-auto rounded-lg bg-primary/10 text-primary grid place-items-center">
              <Icon name={iconName} size={15} />
            </div>
            <strong className="block text-xs text-foreground">{actionName}</strong>
          </button>
        ))}
      </div>
      <Card className="p-4 space-y-3">
        <h2 className="text-sm font-bold text-foreground">My tasks</h2>
        <div className="space-y-2">
          {[
            ['Review resource request', 'Customer Portal needs 2 engineers', 'Today', 'High'],
            ['Approve weekly timesheets', '6 team submissions', 'Today', 'High'],
            ['Confirm project allocation', 'Bao Nguyen onboarding', 'Tomorrow', 'Normal'],
          ].map((x) => (
            <div
              key={x[0]}
              className="p-3 border border-border rounded-lg flex items-center justify-between text-xs"
            >
              <div>
                <div className="flex items-center gap-2">
                  <Badge tone={x[3] === 'High' ? 'warning' : 'neutral'}>{x[3]}</Badge>
                  <small className="text-muted">{x[2]}</small>
                </div>
                <strong className="block text-foreground mt-1">{x[0]}</strong>
                <p className="text-muted">{x[1]}</p>
              </div>
              <Button variant="secondary">View details</Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function ITServiceView({ toast }: { toast: (s: string) => void }) {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);

  const statsQuery = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: fetchDashboardStats,
  });

  const requestsQuery = useQuery({
    queryKey: ['requests', { page, status: statusFilter, type: typeFilter }],
    queryFn: () =>
      fetchRequests({
        page,
        limit: 15,
        status: statusFilter || undefined,
        type: typeFilter || undefined,
      }),
    placeholderData: keepPreviousData,
  });

  const detailQuery = useQuery({
    queryKey: ['request-detail', selectedId],
    queryFn: () => fetchRequestDetail(selectedId!),
    enabled: Boolean(selectedId),
  });

  const handleRefresh = async () => {
    await queryClient.invalidateQueries();
    toast('Dữ liệu đã được cập nhật từ database');
  };

  const handleStatusChange = (newStatus: string) => {
    setStatusFilter(newStatus);
    setPage(1);
  };

  const handleTypeChange = (newType: string) => {
    setTypeFilter(newType);
    setPage(1);
  };

  const handleSelectRequest = (item: ServiceRequestItem) => {
    setSelectedId(item.id);
  };

  const requestsData = requestsQuery.data?.items || [];
  const totalPages = requestsQuery.data?.totalPages || 1;
  const isRefreshing = statsQuery.isFetching || requestsQuery.isFetching;

  return (
    <div className="space-y-4">
      {/* Read-only notice (ADR-0001 Shadow Phase) */}
      <div className="bg-amber-500/10 border border-amber-500/20 px-4 py-2.5 rounded-xl text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span>
            <strong>GIAI ĐOẠN A (SHADOW RUN — CHỈ ĐỌC):</strong> Hệ thống đang chạy song song và lấy
            dữ liệu đồng bộ từ Google Sheets qua Service Account API.
          </span>
        </div>
        <span className="font-mono bg-amber-200/50 dark:bg-amber-900/40 text-amber-900 dark:text-amber-200 px-2 py-0.5 rounded font-semibold text-[11px]">
          MODE: READ-ONLY
        </span>
      </div>

      <PageHeader
        title="IT Asset Operations"
        subtitle="Quản lý quy trình cấp phát, đổi trả & sửa chữa Laptop / Thiết bị CNTT"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              Làm mới dữ liệu
            </Button>
            <Button onClick={() => toast('Báo cáo tài sản IT đã được tải')}>⇩ Xuất báo cáo</Button>
          </div>
        }
      />

      {/* Sync Status Banner */}
      <Card className="p-3.5 text-xs text-foreground flex items-center justify-between">
        <div>
          <span className="font-semibold block">
            Nguồn đồng bộ: {statsQuery.data?.legacySource || 'Google Sheets Service Account'}
          </span>
          <p className="text-muted text-[11px]">
            Lần hoàn thành gần nhất:{' '}
            {statsQuery.data?.lastSync?.finished_at
              ? new Date(statsQuery.data.lastSync.finished_at).toLocaleString('vi-VN', {
                  timeZone: 'Asia/Ho_Chi_Minh',
                })
              : 'Chưa có lượt chạy'}
          </p>
        </div>
        <Badge tone={statsQuery.data?.lastSync?.status === 'COMPLETED' ? 'success' : 'warning'}>
          Sync: {statsQuery.data?.lastSync?.status ?? 'READY'}
        </Badge>
      </Card>

      {/* Metric Cards */}
      <MetricCards stats={statsQuery.data || null} loading={statsQuery.isLoading} />

      {/* Request Table & Timeline layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-surface rounded-xl border border-border shadow-xs overflow-hidden flex flex-col">
          <RequestFilters
            status={statusFilter}
            type={typeFilter}
            page={page}
            totalPages={totalPages}
            onStatusChange={handleStatusChange}
            onTypeChange={handleTypeChange}
          />
          <RequestTable
            items={requestsData}
            selectedId={selectedId}
            loading={requestsQuery.isLoading}
            page={page}
            totalPages={totalPages}
            onSelect={handleSelectRequest}
            onPageChange={setPage}
          />
        </div>

        <RequestTimeline request={detailQuery.data || null} loading={detailQuery.isLoading} />
      </div>
    </div>
  );
}

function GenericModuleView({ pageName }: { pageName: string }) {
  return (
    <div className="space-y-4">
      <PageHeader
        title={pageName}
        subtitle={`Module ${pageName} — CompanyLab Operations Management`}
      />
      <Card className="p-12 text-center space-y-2">
        <Icon name={pageName} size={28} className="mx-auto text-primary" />
        <h2 className="text-sm font-bold text-foreground">{pageName} module</h2>
        <p className="text-xs text-muted max-w-sm mx-auto">
          This module is scheduled in the CompanyLab roadmap as part of the unified ERP rollout.
        </p>
        <Button variant="secondary" className="mt-2">
          View module roadmap
        </Button>
      </Card>
    </div>
  );
}

function Dialogs({
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
  if (!search && !create) return null;
  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-start justify-center pt-[12vh] p-4"
      onClick={() => {
        setSearch(false);
        setCreate(false);
      }}
    >
      <div
        className="w-full max-w-lg bg-surface border border-border rounded-xl shadow-2xl p-4 text-foreground"
        onClick={(e) => e.stopPropagation()}
      >
        {search ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <Search className="w-4 h-4 text-muted" />
              <input
                autoFocus
                placeholder="Search projects, people, requests, invoices..."
                className="bg-transparent border-0 outline-none text-xs text-foreground placeholder:text-muted flex-1"
              />
              <kbd className="font-mono text-[10px] bg-surface-subtle border border-border px-1.5 py-0.5 rounded text-muted">
                ESC
              </kbd>
            </div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Quick Navigation
            </p>
            <div className="space-y-1">
              {[
                { label: 'IT Service (Asset Requests)', target: 'IT Service' },
                { label: 'Operations Overview', target: 'Overview' },
                { label: 'Projects & Deliveries', target: 'Projects' },
                { label: 'People (Onboarding)', target: 'People' },
                { label: 'Data & Migration', target: 'Data & Migration' },
                { label: 'My Work', target: 'My Work' },
              ].map((x) => (
                <button
                  key={x.label}
                  onClick={() => {
                    setPage(x.target as Page);
                    setSearch(false);
                  }}
                  className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-surface-subtle text-xs transition"
                >
                  <div className="flex items-center gap-2">
                    <Icon name={x.target} size={15} />
                    <span>{x.label}</span>
                  </div>
                  <span className="text-[10px] text-muted font-mono">↵</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h2 className="text-sm font-bold text-foreground">Create new</h2>
                <p className="text-xs text-muted">Choose an item to create in CompanyLab</p>
              </div>
              <Button variant="ghost" onClick={() => setCreate(false)}>
                <X size={16} />
              </Button>
            </div>
            <div className="space-y-1">
              {[
                { label: 'IT Ticket / Request', target: 'IT Service' },
                { label: 'Project', target: 'Projects' },
                { label: 'Employee Onboarding', target: 'People' },
                { label: 'Sync Run', target: 'Data & Migration' },
              ].map((x) => (
                <button
                  key={x.label}
                  onClick={() => {
                    setPage(x.target as Page);
                    setCreate(false);
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-surface-subtle text-xs transition"
                >
                  <div className="flex items-center gap-2.5">
                    <Icon name={x.target} size={16} className="text-primary" />
                    <div className="text-left">
                      <b className="block text-foreground">{x.label}</b>
                      <small className="text-muted text-[11px]">Open {x.target} view</small>
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

export default function App() {
  const [page, setPage] = useState<Page>('Overview');
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState(false);
  const [create, setCreate] = useState(false);
  const [project, setProject] = useState<(typeof projects)[0] | null>(null);
  const [message, setMessage] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const queryClient = useQueryClient();

  // Load and apply theme on initial mount
  useEffect(() => {
    const saved = localStorage.getItem('companylab-theme') as 'light' | 'dark' | null;
    if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setTheme('dark');
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      setTheme('light');
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    if (next === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      localStorage.setItem('companylab-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      localStorage.setItem('companylab-theme', 'light');
    }
  };

  const toast = (s: string) => {
    setMessage(s);
    window.setTimeout(() => setMessage(''), 3500);
  };

  useMemo(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearch(true);
      }
      if (e.key === 'Escape') {
        setSearch(false);
        setCreate(false);
      }
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', handler);
      return () => window.removeEventListener('keydown', handler);
    }
  }, []);

  const handleNavigate = (newPage: Page) => {
    setProject(null);
    setPage(newPage);
  };

  const renderContent = () => {
    if (project) {
      return <ProjectDetail project={project} close={() => setProject(null)} />;
    }
    switch (page) {
      case 'Overview':
        return <Overview onProject={setProject} setPage={handleNavigate} toast={toast} />;
      case 'IT Service':
        return <ITServiceView toast={toast} />;
      case 'Projects':
        return <Projects onProject={setProject} />;
      case 'People':
        return <People toast={toast} />;
      case 'Data & Migration':
        return <Migration toast={toast} refetchQueries={() => queryClient.invalidateQueries()} />;
      case 'My Work':
        return <MyWork toast={toast} />;
      default:
        return <GenericModuleView pageName={page} />;
    }
  };

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <Sidebar
        page={page}
        setPage={handleNavigate}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-200 ${
          collapsed ? 'md:ml-[72px]' : 'md:ml-[240px]'
        } ml-0`}
      >
        <Topbar
          page={page}
          openSearch={() => setSearch(true)}
          openCreate={() => setCreate(true)}
          toggleMobile={() => setMobileOpen(true)}
          theme={theme}
          toggleTheme={toggleTheme}
        />
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">{renderContent()}</main>
      </div>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 backdrop-blur-2xs md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <Dialogs
        search={search}
        setSearch={setSearch}
        create={create}
        setCreate={setCreate}
        setPage={handleNavigate}
      />

      {message && (
        <div className="fixed right-5 bottom-5 z-50 bg-slate-900 text-slate-100 dark:bg-slate-800 dark:text-slate-100 border border-slate-700 rounded-xl p-3.5 flex items-center gap-3 shadow-2xl min-w-[280px] animate-in fade-in slide-in-from-bottom-2">
          <span className="w-6 h-6 rounded-full bg-emerald-500 text-white grid place-items-center text-xs shrink-0 font-bold">
            ✓
          </span>
          <div className="flex-1">
            <b className="block text-xs font-semibold">Success</b>
            <small className="text-muted-foreground text-[11px]">{message}</small>
          </div>
          <button onClick={() => setMessage('')} className="text-muted hover:text-white p-1">
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

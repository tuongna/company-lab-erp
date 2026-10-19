'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { Page, ProjectItem } from '@/lib/types/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { QuickDialogs } from '@/components/dialogs/QuickDialogs';
import { OverviewView } from '@/components/modules/overview/OverviewView';
import { ITServiceView } from '@/components/modules/it-service/ITServiceView';
import { ProjectsView } from '@/components/modules/projects/ProjectsView';
import { ProjectDetail } from '@/components/modules/projects/ProjectDetail';
import { PeopleView } from '@/components/modules/people/PeopleView';
import { MigrationView } from '@/components/modules/migration/MigrationView';
import { MyWorkView } from '@/components/modules/my-work/MyWorkView';
import { GenericModuleView } from '@/components/modules/common/GenericModuleView';

export default function App() {
  const [page, setPage] = useState<Page>('Overview');
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState(false);
  const [create, setCreate] = useState(false);
  const [project, setProject] = useState<ProjectItem | null>(null);
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
        return <OverviewView onProject={setProject} setPage={handleNavigate} toast={toast} />;
      case 'IT Service':
        return <ITServiceView toast={toast} />;
      case 'Projects':
        return <ProjectsView onProject={setProject} />;
      case 'People':
        return <PeopleView toast={toast} />;
      case 'Data & Migration':
        return (
          <MigrationView toast={toast} refetchQueries={() => queryClient.invalidateQueries()} />
        );
      case 'My Work':
        return <MyWorkView toast={toast} />;
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

      <QuickDialogs
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

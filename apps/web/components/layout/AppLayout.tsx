'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { Page, PAGE_ROUTES, ROUTE_PAGES } from '@/lib/types/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { QuickDialogs } from '@/components/dialogs/QuickDialogs';
import { useTranslation } from '@/lib/i18n/context';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { locale } = useTranslation();

  // Extract page slug from pathname: /[locale]/[slug]
  const pageSlug = useMemo(() => {
    const parts = pathname.split('/').filter(Boolean);
    // parts[0] is locale (e.g., 'en', 'vi')
    // parts[1] is the module slug (e.g., 'it-service', 'projects')
    return parts[1] || 'overview';
  }, [pathname]);

  const currentPage: Page = ROUTE_PAGES[pageSlug] || 'Overview';

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState(false);
  const [create, setCreate] = useState(false);
  const [message, setMessage] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const mainRef = useRef<HTMLElement>(null);

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

  // Auto-collapse sidebar on viewports below 1024px
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setCollapsed(true);
      }
    };
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 1024) {
        setCollapsed(true);
      }
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  // Reset scroll position on route changes
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [pathname]);

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
    const slug = PAGE_ROUTES[newPage] || 'overview';
    router.push(`/${locale}/${slug}`);
  };

  return (
    <div className="flex min-h-screen overflow-x-hidden bg-background text-foreground">
      <Sidebar
        page={currentPage}
        setPage={handleNavigate}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <div
        className={`flex min-h-screen min-w-0 flex-1 flex-col transition-all duration-200 ${
          collapsed ? 'md:ml-[4.5rem]' : 'md:ml-60'
        }`}
      >
        <Topbar
          page={currentPage}
          openSearch={() => setSearch(true)}
          openCreate={() => setCreate(true)}
          toggleMobile={() => setMobileOpen(!mobileOpen)}
          theme={theme}
          toggleTheme={toggleTheme}
        />

        {message && (
          <div className="animate-in fade-in slide-in-from-top-2 fixed right-5 top-16 z-50 flex items-center gap-2 rounded-xl border border-primary/20 bg-primary px-3.5 py-2.5 text-xs font-semibold text-primary-foreground shadow-xl">
            <span>{message}</span>
            <button
              type="button"
              onClick={() => setMessage('')}
              className="text-primary-foreground/80 hover:text-primary-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        <main ref={mainRef} className="flex-1 overflow-y-auto p-3.5 sm:p-5 lg:p-6">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>

      <QuickDialogs
        search={search}
        setSearch={setSearch}
        create={create}
        setCreate={setCreate}
        setPage={handleNavigate}
      />
    </div>
  );
}

import React, { useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, Plus, Search } from 'lucide-react';
import { ProjectItem } from '@/lib/types/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PageHeader } from '@/components/layout/PageHeader';
import { ProjectTable } from './ProjectTable';
import { useTranslation } from '@/lib/i18n/context';

export function ProjectsView({ onProject }: { onProject: (p: ProjectItem) => void }) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [viewIndex, setViewIndex] = useState(0);

  const tabs = [
    { label: t.projects.allProjects, count: 12 },
    { label: t.projects.myProjects },
    { label: t.projects.atRisk },
    { label: t.projects.archived },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title={t.projects.title}
        subtitle={t.projects.subtitle}
        actions={
          <Button>
            <Plus size={14} /> {t.projects.createProject}
          </Button>
        }
      />
      <div className="flex items-center gap-4 overflow-x-auto border-b border-border text-xs font-semibold">
        {tabs.map((tab, idx) => (
          <button
            type="button"
            key={tab.label}
            className={`whitespace-nowrap border-b-2 py-2 transition ${
              viewIndex === idx
                ? 'border-primary font-bold text-primary'
                : 'border-transparent text-muted hover:text-foreground'
            }`}
            onClick={() => setViewIndex(idx)}
          >
            {tab.label}{' '}
            {tab.count !== undefined && (
              <span className="ml-1 rounded-full bg-slate-500/15 px-2 py-0.5 text-sm text-slate-700 dark:text-slate-300">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>
      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-3">
          <div className="flex h-8 w-full items-center gap-2 rounded-lg border border-border bg-surface-subtle px-2.5 sm:w-64">
            <Search className="h-3.5 w-3.5 text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.projects.searchPlaceholder}
              aria-label={t.projects.searchPlaceholder}
              className="w-full border-0 bg-transparent text-xs text-foreground outline-none placeholder:text-muted"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary">
              <span>{t.common.status}</span>
              <ChevronDown size={14} className="text-muted" />
            </Button>
            <Button variant="secondary">
              <span>{t.projects.projectClient}</span>
              <ChevronDown size={14} className="text-muted" />
            </Button>
            <Button variant="secondary">
              <span>{t.projects.manager}</span>
              <ChevronDown size={14} className="text-muted" />
            </Button>
            <Button variant="secondary">
              <span>{t.common.department}</span>
              <ChevronDown size={14} className="text-muted" />
            </Button>
          </div>
        </div>
        <ProjectTable full query={query} onRow={onProject} />
        <div className="flex items-center justify-between border-t border-border p-3 text-xs text-muted">
          <span>Showing 1–5 of 12 projects</span>
          <div className="flex items-center gap-1">
            <Button
              variant="secondary"
              disabled
              className="h-7 w-7 p-0"
              aria-label={t.common.previousPage}
            >
              <ChevronLeft size={13} className="shrink-0" />
            </Button>
            <Button
              variant="primary"
              className="h-7 w-7 p-0 font-bold"
              aria-label={`${t.common.page} 1`}
              aria-current="page"
            >
              1
            </Button>
            <Button variant="secondary" className="h-7 w-7 p-0" aria-label={`${t.common.page} 2`}>
              2
            </Button>
            <Button variant="secondary" className="h-7 w-7 p-0" aria-label={`${t.common.page} 3`}>
              3
            </Button>
            <Button variant="secondary" className="h-7 w-7 p-0" aria-label={t.common.nextPage}>
              <ChevronRight size={13} className="shrink-0" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

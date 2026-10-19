import React, { useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, Plus, Search } from 'lucide-react';
import { ProjectItem } from '@/lib/types/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PageHeader } from '@/components/layout/PageHeader';
import { ProjectTable } from './ProjectTable';

export function ProjectsView({ onProject }: { onProject: (p: ProjectItem) => void }) {
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
            <Button variant="secondary">
              <span>Status</span>
              <ChevronDown size={14} className="text-muted" />
            </Button>
            <Button variant="secondary">
              <span>Client</span>
              <ChevronDown size={14} className="text-muted" />
            </Button>
            <Button variant="secondary">
              <span>Manager</span>
              <ChevronDown size={14} className="text-muted" />
            </Button>
            <Button variant="secondary">
              <span>Department</span>
              <ChevronDown size={14} className="text-muted" />
            </Button>
          </div>
        </div>
        <ProjectTable full query={query} onRow={onProject} />
        <div className="p-3 border-t border-border flex items-center justify-between text-xs text-muted">
          <span>Showing 1–5 of 12 projects</span>
          <div className="flex items-center gap-1">
            <Button variant="secondary" disabled className="w-7 h-7 p-0">
              <ChevronLeft size={13} className="shrink-0" />
            </Button>
            <Button variant="primary" className="w-7 h-7 p-0 font-bold">
              1
            </Button>
            <Button variant="secondary" className="w-7 h-7 p-0">
              2
            </Button>
            <Button variant="secondary" className="w-7 h-7 p-0">
              3
            </Button>
            <Button variant="secondary" className="w-7 h-7 p-0">
              <ChevronRight size={13} className="shrink-0" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

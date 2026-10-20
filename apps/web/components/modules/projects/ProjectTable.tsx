import React from 'react';
import { MoreHorizontal, Search } from 'lucide-react';
import { ProjectItem, mockProjects } from '@/lib/types/navigation';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n/context';

export function ProjectTable({
  full = false,
  query = '',
  onRow,
}: {
  full?: boolean;
  query?: string;
  onRow: (p: ProjectItem) => void;
}) {
  const { t } = useTranslation();

  const rows = mockProjects.filter((p) =>
    `${p.name} ${p.client} ${p.manager}`.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-border bg-surface-subtle text-sm font-semibold uppercase text-muted">
          <tr>
            {full && (
              <th className="px-3 py-2.5">
                <input type="checkbox" aria-label={t.a11y.selectAll} className="rounded" />
              </th>
            )}
            {full && <th className="px-3 py-2.5">{t.projects.projectCode}</th>}
            <th className="px-3 py-2.5">{t.projects.projectClient}</th>
            <th className="px-3 py-2.5">{t.projects.manager}</th>
            <th className="px-3 py-2.5">{t.common.status}</th>
            {!full && <th className="px-3 py-2.5">{t.projects.nextMilestone}</th>}
            <th className="px-3 py-2.5">{t.projects.targetDate}</th>
            {full && <th className="px-3 py-2.5 text-right">{t.projects.budget}</th>}
            <th className="px-3 py-2.5 text-right">{t.projects.allocation}</th>
            <th className="px-3 py-2.5 text-right">
              <span className="sr-only">{t.common.moreOptions}</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((p) => (
            <tr
              key={p.code}
              onClick={() => onRow(p)}
              className="cursor-pointer transition hover:bg-surface-subtle"
            >
              {full && (
                <td className="px-3 py-2.5">
                  <input
                    type="checkbox"
                    aria-label={`${t.a11y.selectItem}: ${p.name}`}
                    onClick={(e) => e.stopPropagation()}
                    className="rounded"
                  />
                </td>
              )}
              {full && <td className="px-3 py-2.5 font-mono text-muted">{p.code}</td>}
              <td className="px-3 py-2.5">
                <div className="font-medium text-foreground transition hover:text-primary">
                  {p.name}
                </div>
                <div className="text-sm text-muted">{p.client}</div>
              </td>
              <td className="px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <Avatar
                    initials={p.manager
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                    className="h-7 w-7 text-sm"
                  />
                  <span>{p.manager}</span>
                </div>
              </td>
              <td className="px-3 py-2.5">
                <Badge tone={p.tone}>{p.status}</Badge>
              </td>
              {!full && <td className="px-3 py-2.5 text-muted">{p.milestone}</td>}
              <td className="px-3 py-2.5 text-muted">{p.due}</td>
              {full && <td className="px-3 py-2.5 text-right font-medium">{p.budget}</td>}
              <td className="px-3 py-2.5 text-right font-semibold">{p.allocation}</td>
              <td className="px-3 py-2.5 text-right">
                <Button
                  variant="ghost"
                  className="p-1"
                  aria-label={`${t.a11y.optionsFor}: ${p.name}`}
                >
                  <MoreHorizontal size={14} />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && (
        <div className="space-y-2 py-12 text-center text-muted">
          <Search className="mx-auto h-8 w-8 text-muted-foreground opacity-50" />
          <strong className="block text-sm text-foreground">No projects found</strong>
          <p className="text-xs">Try changing your search or removing a filter.</p>
          <Button variant="secondary" className="mt-2">
            Clear filters
          </Button>
        </div>
      )}
    </div>
  );
}

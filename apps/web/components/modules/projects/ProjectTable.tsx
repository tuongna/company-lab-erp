import React from 'react';
import { MoreHorizontal, Search } from 'lucide-react';
import { ProjectItem, mockProjects } from '@/lib/types/navigation';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n/context';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

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
    <div className="relative w-full overflow-x-auto">
      <Table>
        <TableHeader>
          <tr>
            {full && (
              <TableHead preset="selection">
                <input type="checkbox" aria-label={t.a11y.selectAll} className="rounded" />
              </TableHead>
            )}
            {full && <TableHead preset="code">{t.projects.projectCode}</TableHead>}
            <TableHead preset="content">{t.projects.projectClient}</TableHead>
            <TableHead preset="person">{t.projects.manager}</TableHead>
            <TableHead preset="badge">{t.common.status}</TableHead>
            {!full && <TableHead preset="content">{t.projects.nextMilestone}</TableHead>}
            <TableHead preset="datetime">{t.projects.targetDate}</TableHead>
            {full && <TableHead preset="numeric">{t.projects.budget}</TableHead>}
            <TableHead preset="numeric">{t.projects.allocation}</TableHead>
            <TableHead preset="actions">
              <span className="sr-only">{t.common.moreOptions}</span>
            </TableHead>
          </tr>
        </TableHeader>
        <TableBody>
          {rows.map((p) => (
            <TableRow key={p.code} onClick={() => onRow(p)} className="cursor-pointer">
              {full && (
                <TableCell preset="selection">
                  <input
                    type="checkbox"
                    aria-label={`${t.a11y.selectItem}: ${p.name}`}
                    onClick={(e) => e.stopPropagation()}
                    className="rounded"
                  />
                </TableCell>
              )}
              {full && (
                <TableCell preset="code" className="text-muted">
                  {p.code}
                </TableCell>
              )}
              <TableCell preset="content">
                <div className="font-medium text-foreground transition hover:text-primary">
                  {p.name}
                </div>
                <div className="text-sm text-muted">{p.client}</div>
              </TableCell>
              <TableCell preset="person">
                <div className="flex items-center gap-2">
                  <Avatar
                    initials={p.manager
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                    className="h-8 w-8 text-sm"
                  />
                  <span>{p.manager}</span>
                </div>
              </TableCell>
              <TableCell preset="badge">
                <Badge tone={p.tone}>{p.status}</Badge>
              </TableCell>
              {!full && (
                <TableCell preset="content" className="text-muted">
                  {p.milestone}
                </TableCell>
              )}
              <TableCell preset="datetime">{p.due}</TableCell>
              {full && (
                <TableCell preset="numeric" className="font-medium text-foreground">
                  {p.budget}
                </TableCell>
              )}
              <TableCell preset="numeric" className="font-semibold text-foreground">
                {p.allocation}
              </TableCell>
              <TableCell preset="actions">
                <Button
                  variant="ghost"
                  className="p-1"
                  aria-label={`${t.a11y.optionsFor}: ${p.name}`}
                >
                  <MoreHorizontal size={14} />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
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

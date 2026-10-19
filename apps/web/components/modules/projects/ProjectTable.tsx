import React from 'react';
import { MoreHorizontal, Search } from 'lucide-react';
import { ProjectItem, mockProjects } from '@/lib/types/navigation';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function ProjectTable({
  full = false,
  query = '',
  onRow,
}: {
  full?: boolean;
  query?: string;
  onRow: (p: ProjectItem) => void;
}) {
  const rows = mockProjects.filter((p) =>
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

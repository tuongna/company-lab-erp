import React from 'react';
import { ChevronLeft, MoreHorizontal } from 'lucide-react';
import { ProjectItem } from '@/lib/types/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PageHeader } from '@/components/layout/PageHeader';

export function ProjectDetail({ project, close }: { project: ProjectItem; close: () => void }) {
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

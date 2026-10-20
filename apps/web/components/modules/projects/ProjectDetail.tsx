import React from 'react';
import { ChevronLeft, MoreHorizontal } from 'lucide-react';
import { ProjectItem } from '@/lib/types/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PageHeader } from '@/components/layout/PageHeader';
import { useTranslation } from '@/lib/i18n/context';

export function ProjectDetail({ project, close }: { project: ProjectItem; close: () => void }) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <Button
        variant="ghost"
        onClick={close}
        className="-ml-2 text-primary hover:text-primary-hover"
      >
        <ChevronLeft size={16} /> ← {t.navigation.projects}
      </Button>
      <PageHeader
        title={project.name}
        subtitle={`${project.code} · ${project.client}`}
        actions={
          <>
            <Badge tone={project.tone}>{project.status}</Badge>
            <Button variant="secondary">{t.common.edit}</Button>
            <Button variant="ghost" aria-label={`${t.common.moreOptions}: ${project.name}`}>
              <MoreHorizontal size={15} />
            </Button>
          </>
        }
      />
      <div className="grid grid-cols-2 gap-3 rounded-xl border border-border bg-surface p-4 sm:grid-cols-4">
        <div>
          <small className="block text-sm font-bold uppercase text-muted">
            {t.projects.manager}
          </small>
          <b className="text-sm font-semibold text-foreground">{project.manager}</b>
        </div>
        <div>
          <small className="block text-sm font-bold uppercase text-muted">CONTRACT REF</small>
          <b className="text-sm font-semibold text-foreground">CTR-2026-041</b>
        </div>
        <div>
          <small className="block text-sm font-bold uppercase text-muted">
            {t.projects.targetDate}
          </small>
          <b className="text-sm font-semibold text-foreground">{project.due}</b>
        </div>
        <div>
          <small className="block text-sm font-bold uppercase text-muted">
            {t.projects.budget}
          </small>
          <b className="text-sm font-semibold text-foreground">{project.budget}</b>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="space-y-3 p-4 lg:col-span-2">
          <h2 className="text-sm font-bold text-foreground">Delivery health</h2>
          <div className="space-y-1 rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-sm">
            <Badge tone="warning">Risk</Badge>
            <strong className="mt-1 block text-foreground">UAT completion is behind plan</strong>
            <p className="text-muted">
              Client testers have completed 68% of test cases. Two critical workflows remain
              unverified.
            </p>
            <span className="block text-sm text-muted-foreground">
              Owner: {project.manager} · Review by 16 Oct
            </span>
          </div>
          <div className="space-y-1 rounded-lg border border-rose-500/20 bg-rose-500/10 p-3 text-sm">
            <Badge tone="danger">Blocker</Badge>
            <strong className="mt-1 block text-foreground">Production credentials pending</strong>
            <p className="text-muted">
              Client security team approval is required before deployment rehearsal.
            </p>
            <span className="block text-sm text-muted-foreground">
              Owner: Northstar IT · Due 15 Oct
            </span>
          </div>
        </Card>
        <Card className="space-y-3 p-4">
          <h2 className="text-sm font-bold text-foreground">Financial summary</h2>
          <div className="space-y-2 text-xs">
            {[
              ['Contract value', project.budget],
              ['Recognized revenue', '₫1.42B'],
              ['Invoiced amount', '₫1.18B'],
              ['Cash received', '₫720M'],
            ].map((x) => (
              <div key={x[0]} className="flex justify-between border-b border-border py-1">
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

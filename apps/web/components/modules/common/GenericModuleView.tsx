import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { PageHeader } from '@/components/layout/PageHeader';

export function GenericModuleView({ pageName }: { pageName: string }) {
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

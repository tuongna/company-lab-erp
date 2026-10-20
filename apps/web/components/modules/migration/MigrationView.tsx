import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PageHeader } from '@/components/layout/PageHeader';

export function MigrationView({
  toast,
  refetchQueries,
}: {
  toast: (s: string) => void;
  refetchQueries: () => void;
}) {
  const [tab, setTab] = useState('Sources');
  const sources = [
    [
      'IT Asset & Operations',
      'IT Support',
      'Google Sheets',
      'Nguyen Anh Tuong',
      'Google Sheets (Phase A)',
      'Sheets → ERP',
      'Realtime / API',
      'Healthy',
    ],
    [
      'Sales Master',
      'Sales',
      'Google Sheets',
      'Thu Nguyen',
      'Google Sheets',
      'Sheets → ERP',
      'Today, 09:42',
      'Healthy',
    ],
    [
      'Employee Directory',
      'HR',
      'Google Sheets',
      'Linh Ho',
      'ERP',
      'Sheets → ERP',
      'Today, 09:40',
      'Review',
    ],
    [
      'Project Tracker',
      'Delivery',
      'Google Sheets',
      'Minh Tran',
      'ERP',
      'Sheets → ERP',
      'Today, 09:38',
      'Healthy',
    ],
    [
      'Invoice Register',
      'Finance',
      'Google Sheets',
      'Mai Pham',
      'Google Sheets',
      'Sheets → ERP',
      'Yesterday, 18:15',
      'Partial failure',
    ],
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Data & Migration"
        subtitle="Controlled migration from Google Sheets to CompanyLab ERP (ADR-0001, ADR-0002)"
        actions={
          <>
            <Button variant="secondary">Migration settings</Button>
            <Button
              onClick={() => {
                refetchQueries();
                toast('Sync started with Google Sheets. You can continue working.');
              }}
            >
              Run sync
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ['Connected sources', '5', '4 healthy'],
          ['Last sync run', '09:42', 'Phase A Shadow Run'],
          ['Records requiring review', '3', 'Quarantined'],
          ['Migration phase', 'Phase 2', 'Parallel validation'],
        ].map((x, i) => (
          <Card key={x[0]} className="flex flex-col gap-2 p-4">
            <span className="text-xs text-muted">{x[0]}</span>
            <strong className="text-xl font-bold text-foreground">{x[1]}</strong>
            <Badge tone={i === 2 ? 'warning' : i === 3 ? 'info' : 'success'}>{x[2]}</Badge>
          </Card>
        ))}
      </div>

      <div className="flex items-center gap-4 overflow-x-auto border-b border-border text-xs font-semibold">
        {['Sources', 'Field Mapping', 'Sync Runs', 'Reconciliation', 'Cutover'].map((x) => (
          <button
            type="button"
            key={x}
            className={`whitespace-nowrap border-b-2 py-2 transition ${
              tab === x
                ? 'border-primary font-bold text-primary'
                : 'border-transparent text-muted hover:text-foreground'
            }`}
            onClick={() => setTab(x)}
          >
            {x}
          </button>
        ))}
      </div>

      {tab === 'Sources' ? (
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-border p-4">
            <div>
              <h2 className="text-sm font-bold text-foreground">Connected sources</h2>
              <p className="text-xs text-muted">
                Ownership and sync direction are explicitly controlled per entity
              </p>
            </div>
            <Button variant="secondary">Connect source</Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-surface-subtle text-sm font-semibold uppercase text-muted">
                <tr>
                  {[
                    'Source name',
                    'Department',
                    'Source type',
                    'Data owner',
                    'Source of truth',
                    'Sync direction',
                    'Last sync',
                    'Health',
                  ].map((x) => (
                    <th key={x} className="px-3 py-2.5">
                      {x}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {sources.map((s) => (
                  <tr key={s[0]} className="transition hover:bg-surface-subtle">
                    {s.map((x, i) => (
                      <td key={`${s[0]}-${i}`} className="px-3 py-2.5">
                        {i === 0 ? (
                          <span className="font-semibold text-primary">{x}</span>
                        ) : i === 4 ? (
                          <Badge tone="info">{x}</Badge>
                        ) : i === 7 ? (
                          <Badge tone={x === 'Healthy' ? 'success' : 'warning'}>{x}</Badge>
                        ) : (
                          <span className="text-muted">{x}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : tab === 'Reconciliation' ? (
        <Card className="space-y-3 p-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h2 className="text-sm font-bold text-foreground">Reconciliation summary</h2>
              <p className="text-xs text-muted">
                Data copied is tracked separately from data verified
              </p>
            </div>
            <Badge tone="warning">Verification in progress</Badge>
          </div>
          <div className="space-y-2 text-xs">
            {[
              ['Employee records', '184', '184', 'Verified'],
              ['IT Assets & Laptops', '64', '64', 'Verified'],
              ['IT Service Requests', '118', '118', 'Verified'],
              ['Projects', '42', '42', 'Verified'],
              ['Invoice total', '₫8.42B', '₫8.42B', 'Needs review'],
              ['Missing references', '—', '3', 'Review'],
            ].map((x) => (
              <div key={x[0]} className="grid grid-cols-4 items-center border-b border-border py-2">
                <b className="text-foreground">{x[0]}</b>
                <span className="text-muted">Source: {x[1]}</span>
                <span className="text-foreground">ERP: {x[2]}</span>
                <div className="text-right">
                  <Badge tone={x[3] === 'Verified' ? 'success' : 'warning'}>{x[3]}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : (
        <Card className="space-y-2 p-12 text-center">
          <Check className="mx-auto h-8 w-8 text-primary" />
          <h2 className="text-sm font-bold text-foreground">{tab}</h2>
          <p className="mx-auto max-w-md text-xs text-muted">
            {tab === 'Cutover'
              ? 'Complete reconciliation and resolve 3 pending quarantined issues before ownership switches to ERP.'
              : 'Configuration is ready for administrator review.'}
          </p>
          <Button>{tab === 'Cutover' ? 'Review readiness' : 'Open configuration'}</Button>
        </Card>
      )}
    </div>
  );
}

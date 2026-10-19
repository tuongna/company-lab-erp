import React from 'react';
import { ChevronRight, Search, X } from 'lucide-react';
import { Page } from '@/lib/types/navigation';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';

export function QuickDialogs({
  search,
  setSearch,
  create,
  setCreate,
  setPage,
}: {
  search: boolean;
  setSearch: (v: boolean) => void;
  create: boolean;
  setCreate: (v: boolean) => void;
  setPage: (p: Page) => void;
}) {
  if (!search && !create) return null;
  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-start justify-center pt-[12vh] p-4"
      onClick={() => {
        setSearch(false);
        setCreate(false);
      }}
    >
      <div
        className="w-full max-w-lg bg-surface border border-border rounded-xl shadow-2xl p-4 text-foreground"
        onClick={(e) => e.stopPropagation()}
      >
        {search ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <Search className="w-4 h-4 text-muted" />
              <input
                autoFocus
                placeholder="Search projects, people, requests, invoices..."
                className="bg-transparent border-0 outline-none text-xs text-foreground placeholder:text-muted flex-1"
              />
              <kbd className="font-mono text-[10px] bg-surface-subtle border border-border px-1.5 py-0.5 rounded text-muted">
                ESC
              </kbd>
            </div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Quick Navigation
            </p>
            <div className="space-y-1">
              {[
                { label: 'IT Service (Asset Requests)', target: 'IT Service' },
                { label: 'Operations Overview', target: 'Overview' },
                { label: 'Projects & Deliveries', target: 'Projects' },
                { label: 'People (Onboarding)', target: 'People' },
                { label: 'Data & Migration', target: 'Data & Migration' },
                { label: 'My Work', target: 'My Work' },
              ].map((x) => (
                <button
                  key={x.label}
                  onClick={() => {
                    setPage(x.target as Page);
                    setSearch(false);
                  }}
                  className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-surface-subtle text-xs transition"
                >
                  <div className="flex items-center gap-2">
                    <Icon name={x.target} size={15} />
                    <span>{x.label}</span>
                  </div>
                  <span className="text-[10px] text-muted font-mono">↵</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h2 className="text-sm font-bold text-foreground">Create new</h2>
                <p className="text-xs text-muted">Choose an item to create in CompanyLab</p>
              </div>
              <Button variant="ghost" onClick={() => setCreate(false)}>
                <X size={16} />
              </Button>
            </div>
            <div className="bg-amber-500/10 border border-amber-500/20 px-3 py-2 rounded-lg text-[11px] text-amber-800 dark:text-amber-300">
              <strong>Giai đoạn A (Shadow Run — Chỉ đọc):</strong> Mọi thao tác tạo mới và phê duyệt
              được thực hiện trên Google Sheets. Dữ liệu sẽ tự động đồng bộ về hệ thống.
            </div>
            <div className="space-y-1">
              {[
                { label: 'IT Ticket / Request', target: 'IT Service' },
                { label: 'Project', target: 'Projects' },
                { label: 'Employee Onboarding', target: 'People' },
                { label: 'Sync Run', target: 'Data & Migration' },
              ].map((x) => (
                <button
                  key={x.label}
                  onClick={() => {
                    setPage(x.target as Page);
                    setCreate(false);
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-surface-subtle text-xs transition"
                >
                  <div className="flex items-center gap-2.5">
                    <Icon name={x.target} size={16} className="text-primary" />
                    <div className="text-left">
                      <b className="block text-foreground">{x.label}</b>
                      <small className="text-muted text-[11px]">Open {x.target} view</small>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-muted" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

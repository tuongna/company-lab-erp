'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { OverviewView } from '@/components/modules/overview/OverviewView';
import { Page, PAGE_ROUTES, ProjectItem } from '@/lib/types/navigation';
import { useTranslation } from '@/lib/i18n/context';

export default function OverviewPage() {
  const router = useRouter();
  const { locale } = useTranslation();

  const handleSelectProject = (project: ProjectItem) => {
    router.push(`/${locale}/projects/${project.code}`);
  };

  const handleSetPage = (page: Page) => {
    const slug = PAGE_ROUTES[page] || 'overview';
    router.push(`/${locale}/${slug}`);
  };

  const toast = (_s: string) => {
    // Toast can be displayed if passed or trigger via custom event
  };

  return <OverviewView onProject={handleSelectProject} setPage={handleSetPage} toast={toast} />;
}

'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProjectDetail } from '@/components/modules/projects/ProjectDetail';
import { mockProjects } from '@/lib/types/navigation';
import { useTranslation } from '@/lib/i18n/context';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { locale } = useTranslation();
  const code = params.code as string;

  const project = mockProjects.find((p) => p.code.toLowerCase() === code?.toLowerCase()) || null;

  const handleClose = () => {
    router.push(`/${locale}/projects`);
  };

  if (!project) {
    return (
      <div className="rounded-xl border border-border bg-surface p-8 text-center text-foreground">
        <h2 className="text-base font-bold">Project not found</h2>
        <p className="mt-1 text-xs text-muted">No project found with code: {code}</p>
        <button
          type="button"
          onClick={handleClose}
          className="mt-4 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary-hover"
        >
          Back to Projects
        </button>
      </div>
    );
  }

  return <ProjectDetail project={project} close={handleClose} />;
}

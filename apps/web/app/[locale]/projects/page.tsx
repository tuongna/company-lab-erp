'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ProjectsView } from '@/components/modules/projects/ProjectsView';
import { ProjectItem } from '@/lib/types/navigation';
import { useTranslation } from '@/lib/i18n/context';

export default function ProjectsPage() {
  const router = useRouter();
  const { locale } = useTranslation();

  const handleSelectProject = (project: ProjectItem) => {
    router.push(`/${locale}/projects/${project.code}`);
  };

  return <ProjectsView onProject={handleSelectProject} />;
}

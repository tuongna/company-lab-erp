'use client';

import React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { MigrationView } from '@/components/modules/migration/MigrationView';

export default function MigrationPage() {
  const queryClient = useQueryClient();
  const toast = (_s: string) => {};

  return <MigrationView toast={toast} refetchQueries={() => queryClient.invalidateQueries()} />;
}

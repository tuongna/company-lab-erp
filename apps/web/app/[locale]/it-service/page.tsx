'use client';

import React from 'react';
import { ITServiceView } from '@/components/modules/it-service/ITServiceView';

export default function ITServicePage() {
  const toast = (_s: string) => {};

  return <ITServiceView toast={toast} />;
}

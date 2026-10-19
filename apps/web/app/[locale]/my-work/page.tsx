'use client';

import React from 'react';
import { MyWorkView } from '@/components/modules/my-work/MyWorkView';

export default function MyWorkPage() {
  const toast = (_s: string) => {};

  return <MyWorkView toast={toast} />;
}

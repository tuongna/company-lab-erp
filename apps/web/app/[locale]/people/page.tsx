'use client';

import React from 'react';
import { PeopleView } from '@/components/modules/people/PeopleView';

export default function PeoplePage() {
  const toast = (_s: string) => {};

  return <PeopleView toast={toast} />;
}

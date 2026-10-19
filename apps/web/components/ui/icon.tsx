import React from 'react';
import {
  BarChart3,
  BriefcaseBusiness,
  Clock3,
  DatabaseBackup,
  FolderKanban,
  LayoutDashboard,
  ListChecks,
  MonitorCog,
  Plus,
  Settings,
  TrendingUp,
  Users,
  WalletCards,
  type LucideIcon,
} from 'lucide-react';

export const icons: Record<string, LucideIcon> = {
  Overview: LayoutDashboard,
  Projects: FolderKanban,
  People: Users,
  Sales: TrendingUp,
  Resources: BarChart3,
  Timesheets: Clock3,
  Finance: WalletCards,
  'IT Service': MonitorCog,
  Reports: BarChart3,
  'Data & Migration': DatabaseBackup,
  Settings,
  'My Work': ListChecks,
  Project: BriefcaseBusiness,
  plus: Plus,
};

export function Icon({
  name,
  size = 18,
  className = '',
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const IconComponent = icons[name] ?? Plus;
  return <IconComponent size={size} strokeWidth={1.8} aria-hidden="true" className={className} />;
}

export type Page =
  | 'Overview'
  | 'IT Service'
  | 'Projects'
  | 'People'
  | 'Data & Migration'
  | 'My Work'
  | 'Sales'
  | 'Resources'
  | 'Timesheets'
  | 'Finance'
  | 'Reports'
  | 'Settings';

export interface ProjectItem {
  code: string;
  name: string;
  client: string;
  manager: string;
  status: string;
  tone: string;
  milestone: string;
  due: string;
  allocation: string;
  budget: string;
}

export const mockProjects: ProjectItem[] = [
  {
    code: 'PRJ-1042',
    name: 'Customer Portal',
    client: 'Northstar Systems',
    manager: 'Minh Tran',
    status: 'At risk',
    tone: 'warning',
    milestone: 'UAT sign-off',
    due: '16 Oct 2026',
    allocation: '92%',
    budget: '₫2.40B',
  },
  {
    code: 'PRJ-1038',
    name: 'Billing Platform',
    client: 'BluePeak Digital',
    manager: 'Sarah Nguyen',
    status: 'On track',
    tone: 'success',
    milestone: 'API integration',
    due: '21 Oct 2026',
    allocation: '76%',
    budget: '₫1.85B',
  },
  {
    code: 'PRJ-1031',
    name: 'Support Automation',
    client: 'Meridian Software',
    manager: 'Huy Pham',
    status: 'Blocked',
    tone: 'danger',
    milestone: 'Security review',
    due: '18 Oct 2026',
    allocation: '84%',
    budget: '₫1.20B',
  },
  {
    code: 'PRJ-1026',
    name: 'Analytics Workspace',
    client: 'HarborTech',
    manager: 'Linh Dao',
    status: 'On track',
    tone: 'success',
    milestone: 'Data validation',
    due: '28 Oct 2026',
    allocation: '68%',
    budget: '₫980M',
  },
  {
    code: 'PRJ-1019',
    name: 'Partner Console',
    client: 'Orchid Labs',
    manager: 'Minh Tran',
    status: 'Planning',
    tone: 'info',
    milestone: 'Kickoff',
    due: '4 Nov 2026',
    allocation: '42%',
    budget: '₫760M',
  },
];

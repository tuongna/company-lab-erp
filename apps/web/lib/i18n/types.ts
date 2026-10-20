export type Locale = 'vi' | 'en' | 'ko';

export interface LocaleOption {
  code: Locale;
  label: string;
  flag: string;
}

export const SUPPORTED_LOCALES: LocaleOption[] = [
  { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'ko', label: '한국어', flag: '🇰🇷' },
];

export interface Translations {
  common: {
    search: string;
    searchPlaceholder: string;
    create: string;
    cancel: string;
    confirm: string;
    save: string;
    edit: string;
    delete: string;
    close: string;
    loading: string;
    noData: string;
    success: string;
    error: string;
    review: string;
    details: string;
    status: string;
    department: string;
    allDepartments: string;
    date: string;
    exportReport: string;
    refreshData: string;
    readOnlyNotice: string;
    readOnlyBadge: string;
    lastSync: string;
    previousPage: string;
    nextPage: string;
    page: string;
    of: string;
    moreOptions: string;
  };
  navigation: {
    operationsWorkspace: string;
    overview: string;
    myWork: string;
    itService: string;
    projects: string;
    people: string;
    resources: string;
    timesheets: string;
    finance: string;
    sales: string;
    dataMigration: string;
    reports: string;
    settings: string;
    helpSupport: string;
    active: string;
    mainMenu: string;
    businessGroup: string;
    adminGroup: string;
    expandSidebar: string;
    collapseSidebar: string;
    toggleMobileMenu: string;
  };
  topbar: {
    searchWorkspace: string;
    searchKeyboardHint: string;
    createNew: string;
    switchToDark: string;
    switchToLight: string;
    switchLanguage: string;
  };
  overview: {
    title: string;
    activeProjects: string;
    pendingRequests: string;
    assignedAssets: string;
    syncSuccessRate: string;
    activeProjectsDesc: string;
    pendingRequestsDesc: string;
    assignedAssetsDesc: string;
    syncSuccessRateDesc: string;
    recentActivities: string;
    activitySubtitle: string;
    departmentCapacity: string;
    departmentCapacitySubtitle: string;
    sheetsSync: string;
    syncReady: string;
    processed: string;
    quarantine: string;
    reviewSyncIssues: string;
  };
  itService: {
    title: string;
    subtitle: string;
    syncSource: string;
    filterAllStatus: string;
    filterAllTypes: string;
    typeAllocation: string;
    typeReturn: string;
    typeRepair: string;
    colCode: string;
    colType: string;
    colEmployee: string;
    colStatus: string;
    colAsset: string;
    colDetails: string;
    totalRequests: string;
    fromGoogleSheets: string;
    typeAllocationShort: string;
    typeReturnShort: string;
    typeRepairShort: string;
    pendingApproval: string;
    pendingApprovalDesc: string;
    inProgress: string;
    inProgressDesc: string;
    totalAssets: string;
    inventoryAvailable: string;
    inventoryAssigned: string;
    statusApproved: string;
    statusCompleted: string;
    statusRejected: string;
    statusCancelled: string;
    timelineTitle: string;
    timelineRequester: string;
    timelineType: string;
    timelineOperator: string;
    unassigned: string;
    timelineAsset: string;
    unattached: string;
    noAssetCode: string;
    fsmProgress: string;
    performedBy: string;
    noHistory: string;
    selectRequestPrompt: string;
  };
  projects: {
    title: string;
    subtitle: string;
    allProjects: string;
    myProjects: string;
    atRisk: string;
    archived: string;
    searchPlaceholder: string;
    createProject: string;
    projectCode: string;
    projectClient: string;
    manager: string;
    budget: string;
    allocation: string;
    nextMilestone: string;
    targetDate: string;
  };
  dialogs: {
    quickNavigation: string;
    createNewTitle: string;
    createNewDesc: string;
    shadowNotice: string;
    closeDialog: string;
  };
  a11y: {
    closeNotification: string;
    closeModal: string;
    selectAll: string;
    selectItem: string;
    optionsFor: string;
    taskOwner: string;
    dueDate: string;
    status: string;
    tableSummary: string;
  };
}

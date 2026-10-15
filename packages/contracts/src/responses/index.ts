import { ServiceRequestStatus, ServiceRequestType } from '../enums';

export interface DashboardStatsResponse {
  requests: {
    total_requests: string;
    pending_approval: string;
    in_progress: string;
    completed: string;
    rejected: string;
    cancelled: string;
    type_allocation: string;
    type_return: string;
    type_repair: string;
  };
  assets: {
    total_assets: string;
    available_assets: string;
    assigned_assets: string;
  };
  mode: string;
  legacySource: string;
  lastSync?: {
    id: string;
    status: string;
    source: string | null;
    extracted_at: string | null;
    finished_at: string | null;
    source_rows: number;
    upserted: number;
    unchanged: number;
    quarantined: number;
  } | null;
}

export interface RequestHistoryItem {
  id: string;
  toStatus: ServiceRequestStatus;
  fromStatus: ServiceRequestStatus | null;
  occurredAt: string;
  note: string | null;
  actor?: {
    name: string;
    role: string;
  };
}

export interface ServiceRequestItem {
  id: string;
  legacyId: string | null;
  requestType: ServiceRequestType;
  status: ServiceRequestStatus;
  version: number;
  createdAt: string;
  updatedAt: string;
  employee?: {
    name: string;
    department: string;
    legacyId: string | null;
  };
  assignedOperator?: {
    name: string;
  } | null;
  asset?: {
    model: string;
    legacyId: string | null;
  } | null;
  history?: RequestHistoryItem[];
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

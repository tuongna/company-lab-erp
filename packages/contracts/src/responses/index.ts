import { ServiceRequestStatus, ServiceRequestType } from '../enums';

export interface DashboardStatsResponse {
  requests: {
    total_requests: number | string;
    pending_approval: number | string;
    in_progress: number | string;
    completed: number | string;
    rejected: number | string;
    cancelled: number | string;
    type_allocation: number | string;
    type_return: number | string;
    type_repair: number | string;
  };
  assets: {
    total_assets: number | string;
    available_assets: number | string;
    assigned_assets: number | string;
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

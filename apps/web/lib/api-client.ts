import {
  DashboardStatsResponse,
  PaginatedResponse,
  ServiceRequestItem,
  TransitionRequestDto,
} from '@companylab/contracts';
import { API_BASE_URL } from './api-config';

export class ApiClientError extends Error {
  constructor(
    public readonly status: number,
    public readonly statusText: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

async function apiFetch<T>(endpoint: string, init?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const res = await fetch(url, {
    ...init,
    cache: init?.cache ?? 'no-store',
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => null);
    const message =
      errorBody?.message ||
      errorBody?.error ||
      `Request failed with status ${res.status}: ${res.statusText}`;
    throw new ApiClientError(res.status, res.statusText, message, errorBody);
  }

  return res.json();
}

export interface FetchRequestsParams {
  page?: number;
  limit?: number;
  status?: string;
  type?: string;
}

export interface FetchAssetsParams {
  page?: number;
  limit?: number;
  status?: string;
  type?: string;
}

export interface FetchEmployeesParams {
  page?: number;
  limit?: number;
  department?: string;
  search?: string;
}

export interface AssetItem {
  id: string;
  legacyId: string | null;
  type: string;
  model: string;
  status: string;
  holderEmployeeId: string | null;
  holderEmployee?: {
    id: string;
    name: string;
    department: string;
    email: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeItem {
  id: string;
  legacyId: string | null;
  name: string;
  department: string;
  role: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export const queryKeys = {
  dashboard: ['dashboard-stats'] as const,
  requests: {
    all: ['requests'] as const,
    list: (params: FetchRequestsParams) => ['requests', 'list', params] as const,
    detail: (id: string) => ['requests', 'detail', id] as const,
  },
  assets: {
    all: ['assets'] as const,
    list: (params: FetchAssetsParams) => ['assets', 'list', params] as const,
    detail: (id: string) => ['assets', 'detail', id] as const,
  },
  employees: {
    all: ['employees'] as const,
    list: (params: FetchEmployeesParams) => ['employees', 'list', params] as const,
    detail: (id: string) => ['employees', 'detail', id] as const,
  },
};

export async function fetchDashboardStats(): Promise<DashboardStatsResponse> {
  return apiFetch<DashboardStatsResponse>('/api/requests/dashboard');
}

export async function fetchRequests(
  params: FetchRequestsParams = {},
): Promise<PaginatedResponse<ServiceRequestItem>> {
  const query = new URLSearchParams();
  if (params.page) query.set('page', params.page.toString());
  if (params.limit) query.set('limit', params.limit.toString());
  if (params.status) query.set('status', params.status);
  if (params.type) query.set('type', params.type);

  const qs = query.toString();
  return apiFetch<PaginatedResponse<ServiceRequestItem>>(`/api/requests${qs ? `?${qs}` : ''}`);
}

export async function fetchRequestDetail(id: string): Promise<ServiceRequestItem> {
  return apiFetch<ServiceRequestItem>(`/api/requests/${encodeURIComponent(id)}`);
}

export async function fetchAssets(
  params: FetchAssetsParams = {},
): Promise<PaginatedResponse<AssetItem>> {
  const query = new URLSearchParams();
  if (params.page) query.set('page', params.page.toString());
  if (params.limit) query.set('limit', params.limit.toString());
  if (params.status) query.set('status', params.status);
  if (params.type) query.set('type', params.type);

  const qs = query.toString();
  return apiFetch<PaginatedResponse<AssetItem>>(`/api/assets${qs ? `?${qs}` : ''}`);
}

export async function fetchAssetDetail(id: string): Promise<AssetItem> {
  return apiFetch<AssetItem>(`/api/assets/${encodeURIComponent(id)}`);
}

export async function fetchEmployees(
  params: FetchEmployeesParams = {},
): Promise<PaginatedResponse<EmployeeItem>> {
  const query = new URLSearchParams();
  if (params.page) query.set('page', params.page.toString());
  if (params.limit) query.set('limit', params.limit.toString());
  if (params.department) query.set('department', params.department);
  if (params.search) query.set('search', params.search);

  const qs = query.toString();
  return apiFetch<PaginatedResponse<EmployeeItem>>(`/api/employees${qs ? `?${qs}` : ''}`);
}

export async function fetchEmployeeDetail(id: string): Promise<EmployeeItem> {
  return apiFetch<EmployeeItem>(`/api/employees/${encodeURIComponent(id)}`);
}

export async function transitionRequest(
  id: string,
  dto: TransitionRequestDto,
): Promise<ServiceRequestItem> {
  return apiFetch<ServiceRequestItem>(`/api/requests/${encodeURIComponent(id)}/transition`, {
    method: 'POST',
    body: JSON.stringify(dto),
  });
}

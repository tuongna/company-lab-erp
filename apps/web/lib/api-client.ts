import {
  DashboardStatsResponse,
  PaginatedResponse,
  ServiceRequestItem,
  TransitionRequestDto,
} from '@companylab/contracts';
import { API_BASE_URL } from './api-config';

export async function fetchDashboardStats(): Promise<DashboardStatsResponse> {
  const res = await fetch(`${API_BASE_URL}/api/requests/dashboard`, {
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch dashboard stats: ${res.statusText}`);
  }
  return res.json();
}

export interface FetchRequestsParams {
  page?: number;
  limit?: number;
  status?: string;
  type?: string;
}

export async function fetchRequests(
  params: FetchRequestsParams = {},
): Promise<PaginatedResponse<ServiceRequestItem>> {
  const query = new URLSearchParams();
  if (params.page) query.set('page', params.page.toString());
  if (params.limit) query.set('limit', params.limit.toString());
  if (params.status) query.set('status', params.status);
  if (params.type) query.set('type', params.type);

  const res = await fetch(`${API_BASE_URL}/api/requests?${query.toString()}`, {
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch requests: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchRequestDetail(id: string): Promise<ServiceRequestItem> {
  const res = await fetch(`${API_BASE_URL}/api/requests/${id}`, {
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch request detail for ${id}: ${res.statusText}`);
  }
  return res.json();
}

export async function transitionRequest(
  id: string,
  dto: TransitionRequestDto,
): Promise<ServiceRequestItem> {
  const res = await fetch(`${API_BASE_URL}/api/requests/${id}/transition`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(dto),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to transition request: ${res.statusText}`);
  }
  return res.json();
}

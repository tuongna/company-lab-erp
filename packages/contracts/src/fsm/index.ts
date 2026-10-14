import { ServiceRequestStatus, UserRole } from '../enums';

export interface TransitionRule {
  from: ServiceRequestStatus | null; // null represents creation
  to: ServiceRequestStatus;
  allowedRoles: UserRole[];
  description: string;
}

export const REQUEST_TRANSITIONS: TransitionRule[] = [
  {
    from: null,
    to: ServiceRequestStatus.PENDING_APPROVAL,
    allowedRoles: [UserRole.EMPLOYEE, UserRole.MANAGER, UserRole.OPERATOR, UserRole.ADMIN],
    description: 'Submit new request',
  },
  {
    from: ServiceRequestStatus.PENDING_APPROVAL,
    to: ServiceRequestStatus.APPROVED,
    allowedRoles: [UserRole.MANAGER, UserRole.ADMIN],
    description: 'Manager approves request',
  },
  {
    from: ServiceRequestStatus.PENDING_APPROVAL,
    to: ServiceRequestStatus.REJECTED,
    allowedRoles: [UserRole.MANAGER, UserRole.ADMIN],
    description: 'Manager rejects request',
  },
  {
    from: ServiceRequestStatus.PENDING_APPROVAL,
    to: ServiceRequestStatus.CANCELLED,
    allowedRoles: [UserRole.EMPLOYEE, UserRole.ADMIN],
    description: 'Requester cancels request',
  },
  {
    from: ServiceRequestStatus.APPROVED,
    to: ServiceRequestStatus.IN_PROGRESS,
    allowedRoles: [UserRole.OPERATOR, UserRole.ADMIN],
    description: 'Operator claims request and starts processing',
  },
  {
    from: ServiceRequestStatus.IN_PROGRESS,
    to: ServiceRequestStatus.COMPLETED,
    allowedRoles: [UserRole.OPERATOR, UserRole.ADMIN],
    description: 'Operator completes handover / return / repair',
  },
];

export function isTransitionAllowed(
  from: ServiceRequestStatus,
  to: ServiceRequestStatus,
  role: UserRole,
): boolean {
  return REQUEST_TRANSITIONS.some(
    (t) => t.from === from && t.to === to && t.allowedRoles.includes(role),
  );
}

export function getAllowedTransitionsForStatus(
  currentStatus: ServiceRequestStatus,
  role: UserRole,
): TransitionRule[] {
  return REQUEST_TRANSITIONS.filter(
    (t) => t.from === currentStatus && t.allowedRoles.includes(role),
  );
}

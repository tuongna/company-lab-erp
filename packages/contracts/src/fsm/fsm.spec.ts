import { describe, it, expect } from 'vitest';
import { REQUEST_TRANSITIONS, isTransitionAllowed, getAllowedTransitionsForStatus } from './index';
import { ServiceRequestStatus, UserRole } from '../enums';

describe('FSM Transitions (ADR-0003 Specification)', () => {
  it('should allow Employee to submit new request (null -> PENDING_APPROVAL)', () => {
    const allowed = REQUEST_TRANSITIONS.some(
      (t) =>
        t.from === null &&
        t.to === ServiceRequestStatus.PENDING_APPROVAL &&
        t.allowedRoles.includes(UserRole.EMPLOYEE),
    );
    expect(allowed).toBe(true);
  });

  it('should allow Manager to approve PENDING_APPROVAL', () => {
    const allowed = isTransitionAllowed(
      ServiceRequestStatus.PENDING_APPROVAL,
      ServiceRequestStatus.APPROVED,
      UserRole.MANAGER,
    );
    expect(allowed).toBe(true);
  });

  it('should allow Manager to reject PENDING_APPROVAL', () => {
    const allowed = isTransitionAllowed(
      ServiceRequestStatus.PENDING_APPROVAL,
      ServiceRequestStatus.REJECTED,
      UserRole.MANAGER,
    );
    expect(allowed).toBe(true);
  });

  it('should NOT allow Employee to approve their own request', () => {
    const allowed = isTransitionAllowed(
      ServiceRequestStatus.PENDING_APPROVAL,
      ServiceRequestStatus.APPROVED,
      UserRole.EMPLOYEE,
    );
    expect(allowed).toBe(false);
  });

  it('should allow Operator to move APPROVED to IN_PROGRESS', () => {
    const allowed = isTransitionAllowed(
      ServiceRequestStatus.APPROVED,
      ServiceRequestStatus.IN_PROGRESS,
      UserRole.OPERATOR,
    );
    expect(allowed).toBe(true);
  });

  it('should allow Operator to move IN_PROGRESS to COMPLETED', () => {
    const allowed = isTransitionAllowed(
      ServiceRequestStatus.IN_PROGRESS,
      ServiceRequestStatus.COMPLETED,
      UserRole.OPERATOR,
    );
    expect(allowed).toBe(true);
  });

  it('should NOT allow Operator to skip directly from APPROVED to COMPLETED', () => {
    const allowed = isTransitionAllowed(
      ServiceRequestStatus.APPROVED,
      ServiceRequestStatus.COMPLETED,
      UserRole.OPERATOR,
    );
    expect(allowed).toBe(false);
  });

  it('should return correct allowed transitions list for given status and role', () => {
    const managerTransitions = getAllowedTransitionsForStatus(
      ServiceRequestStatus.PENDING_APPROVAL,
      UserRole.MANAGER,
    );
    const toStatuses = managerTransitions.map((t) => t.to);

    expect(toStatuses).toContain(ServiceRequestStatus.APPROVED);
    expect(toStatuses).toContain(ServiceRequestStatus.REJECTED);
    expect(toStatuses).not.toContain(ServiceRequestStatus.COMPLETED);
  });
});

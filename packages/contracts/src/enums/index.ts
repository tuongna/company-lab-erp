// Role of system users
export enum UserRole {
  EMPLOYEE = 'EMPLOYEE',
  MANAGER = 'MANAGER',
  OPERATOR = 'OPERATOR',
  ADMIN = 'ADMIN',
}

// IT Asset types and statuses
export enum AssetType {
  LAPTOP = 'LAPTOP',
  MONITOR = 'MONITOR',
}

export enum AssetStatus {
  AVAILABLE = 'AVAILABLE',
  ASSIGNED = 'ASSIGNED',
  MAINTENANCE = 'MAINTENANCE',
}

// Service Request types and statuses
export enum ServiceRequestType {
  ALLOCATION = 'ALLOCATION',
  RETURN = 'RETURN',
  REPAIR = 'REPAIR',
}

export enum ServiceRequestStatus {
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

// Reason why a legacy row was sent to quarantine during ingestion
export enum QuarantineReason {
  MISSING_FK = 'MISSING_FK',
  BAD_ENUM = 'BAD_ENUM',
  BAD_TIMESTAMP = 'BAD_TIMESTAMP',
  COLUMN_SHIFT = 'COLUMN_SHIFT',
  DUPLICATE_KEY = 'DUPLICATE_KEY',
  POLICY_VIOLATION = 'POLICY_VIOLATION',
  INVALID_TRANSITION = 'INVALID_TRANSITION',
}

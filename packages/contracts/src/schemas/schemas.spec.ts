import { describe, it, expect } from 'vitest';
import { CreateServiceRequestSchema, TransitionRequestSchema, CreateAssetSchema } from './index';
import { AssetStatus, AssetType, ServiceRequestStatus, ServiceRequestType } from '../enums';

describe('Contracts Zod Schemas Validation', () => {
  describe('CreateServiceRequestSchema', () => {
    it('should validate valid request data', () => {
      const validData = {
        requestType: ServiceRequestType.ALLOCATION,
        note: 'Need laptop for new engineer',
      };
      const result = CreateServiceRequestSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid requestType', () => {
      const invalidData = {
        requestType: 'INVALID_TYPE',
      };
      const result = CreateServiceRequestSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject non-uuid assetId', () => {
      const invalidData = {
        requestType: ServiceRequestType.REPAIR,
        assetId: 'not-a-valid-uuid',
      };
      const result = CreateServiceRequestSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('TransitionRequestSchema', () => {
    it('should validate valid transition payload', () => {
      const validData = {
        targetStatus: ServiceRequestStatus.APPROVED,
        version: 1,
        note: 'Approved by manager',
      };
      const result = TransitionRequestSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject transition without version (optimistic locking requirement)', () => {
      const invalidData = {
        targetStatus: ServiceRequestStatus.APPROVED,
      };
      const result = TransitionRequestSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('CreateAssetSchema', () => {
    it('should default status to AVAILABLE if not provided', () => {
      const data = {
        type: AssetType.LAPTOP,
        model: 'ThinkPad T14s Gen 4',
      };
      const parsed = CreateAssetSchema.parse(data);
      expect(parsed.status).toBe(AssetStatus.AVAILABLE);
    });
  });
});

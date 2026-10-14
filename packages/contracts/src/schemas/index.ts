import { z } from 'zod';
import {
  AssetStatus,
  AssetType,
  ServiceRequestStatus,
  ServiceRequestType,
  UserRole,
} from '../enums';

export const CreateServiceRequestSchema = z.object({
  requestType: z.nativeEnum(ServiceRequestType),
  assetId: z.string().uuid().optional(),
  note: z.string().max(500).optional(),
});

export type CreateServiceRequestDto = z.infer<typeof CreateServiceRequestSchema>;

export const TransitionRequestSchema = z.object({
  targetStatus: z.nativeEnum(ServiceRequestStatus),
  assignedAssetId: z.string().uuid().optional(),
  note: z.string().max(500).optional(),
  version: z.number().int().min(1),
});

export type TransitionRequestDto = z.infer<typeof TransitionRequestSchema>;

export const CreateAssetSchema = z.object({
  type: z.nativeEnum(AssetType),
  model: z.string().min(2).max(100),
  status: z.nativeEnum(AssetStatus).default(AssetStatus.AVAILABLE),
  holderEmployeeId: z.string().uuid().optional(),
});

export type CreateAssetDto = z.infer<typeof CreateAssetSchema>;

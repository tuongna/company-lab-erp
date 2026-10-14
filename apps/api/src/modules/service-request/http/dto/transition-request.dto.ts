import { IsEnum, IsInt, Min, IsOptional, IsUUID, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ServiceRequestStatus,
  TransitionRequestDto as ITransitionRequestDto,
} from '@companylab/contracts';

export class TransitionRequestHttpDto implements ITransitionRequestDto {
  @ApiProperty({ enum: ServiceRequestStatus, description: 'Target state to transition to' })
  @IsEnum(ServiceRequestStatus)
  targetStatus!: ServiceRequestStatus;

  @ApiProperty({ description: 'Optimistic locking version number', minimum: 1 })
  @IsInt()
  @Min(1)
  version!: number;

  @ApiPropertyOptional({
    description: 'Asset UUID to assign (required when completing allocation)',
  })
  @IsOptional()
  @IsUUID()
  assignedAssetId?: string;

  @ApiPropertyOptional({ description: 'Optional transition remark/note', maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

import { Controller, Get, Param, Query, NotFoundException } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiParam } from '@nestjs/swagger';
import { AssetService } from '../application/asset.service';
import { AssetQueryDto } from './asset-query.dto';

@ApiTags('Assets')
@Controller('api/assets')
export class AssetController {
  constructor(private readonly assetService: AssetService) {}

  @Get()
  @ApiOperation({ summary: 'List assets with pagination and filters (Phase A: Read-Only)' })
  async findAll(@Query() query: AssetQueryDto) {
    return this.assetService.findAll(query.page, query.limit, query.status, query.type);
  }

  @Get(':idOrLegacyId')
  @ApiOperation({ summary: 'Get asset by UUID or legacy ID (Phase A: Read-Only)' })
  @ApiParam({ name: 'idOrLegacyId', description: 'UUID or legacy asset ID (e.g. AST-001)' })
  async findOne(@Param('idOrLegacyId') idOrLegacyId: string) {
    const asset = await this.assetService.findOne(idOrLegacyId);
    if (!asset) {
      throw new NotFoundException(`Asset '${idOrLegacyId}' not found`);
    }
    return asset;
  }
}

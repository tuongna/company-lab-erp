import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ServiceRequestService } from '../application/service-request.service';
import { TransitionService } from '../application/transition.service';
import { RequestQueryDto } from './dto/request-query.dto';
import { TransitionRequestHttpDto } from './dto/transition-request.dto';

@ApiTags('Service Requests')
@Controller('api/requests')
export class ServiceRequestController {
  constructor(
    private readonly service: ServiceRequestService,
    private readonly transitionService: TransitionService,
  ) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get overview dashboard metrics (Read-only shadow mode)' })
  async getDashboard() {
    return this.service.getDashboardStats();
  }

  @Get()
  @ApiOperation({ summary: 'List service requests with pagination and filters' })
  async findAll(@Query() query: RequestQueryDto) {
    return this.service.findAll(query.page, query.limit, query.status, query.type);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get service request details and audit history timeline' })
  async findOne(@Param('id') id: string) {
    const item = await this.service.findOne(id);
    if (!item) throw new NotFoundException(`Request ${id} not found`);
    return item;
  }

  @Post(':id/transition')
  @ApiOperation({
    summary: 'Disabled during shadow migration; authenticated writes require a later cutover',
  })
  async transition(@Param('id') _id: string, @Body() _dto: TransitionRequestHttpDto) {
    // Fail closed even if a caller forges actor headers or changes LEGACY_PHASE.
    // Re-enable only with verified Firebase identity, DB roles and phase-B outbox.
    throw new ForbiddenException('READ_ONLY_SHADOW: update the legacy Google Sheet instead');
  }
}

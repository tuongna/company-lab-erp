import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Headers,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader } from '@nestjs/swagger';
import { ServiceRequestService } from '../application/service-request.service';
import { TransitionService } from '../application/transition.service';
import { RequestQueryDto } from './dto/request-query.dto';
import { TransitionRequestHttpDto } from './dto/transition-request.dto';
import { UserRole } from '@companylab/contracts';

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
  @ApiOperation({ summary: 'Perform atomic FSM state transition (ADR-0003)' })
  @ApiHeader({ name: 'x-actor-id', required: false, description: 'Current operator / actor UUID' })
  @ApiHeader({
    name: 'x-actor-role',
    required: false,
    enum: UserRole,
    description: 'Role of actor',
  })
  async transition(
    @Param('id') id: string,
    @Body() dto: TransitionRequestHttpDto,
    @Headers('x-actor-id') actorId?: string,
    @Headers('x-actor-role') actorRole?: UserRole,
  ) {
    // In dev / shadow mode, default to OPERATOR/ADMIN if headers not provided
    const effectiveActorId = actorId || '00000000-0000-0000-0000-000000000000';
    const effectiveRole = actorRole || UserRole.OPERATOR;

    return this.transitionService.transition(id, dto, effectiveActorId, effectiveRole);
  }
}

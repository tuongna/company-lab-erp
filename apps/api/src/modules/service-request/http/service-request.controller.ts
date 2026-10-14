import { Controller, Get, Param, Query, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ServiceRequestService } from '../application/service-request.service';

@ApiTags('Service Requests')
@Controller('api/requests')
export class ServiceRequestController {
  constructor(private readonly service: ServiceRequestService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get overview dashboard metrics (Read-only shadow mode)' })
  async getDashboard() {
    return this.service.getDashboardStats();
  }

  @Get()
  @ApiOperation({ summary: 'List service requests with pagination and filters' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'type', required: false, type: String })
  async findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('status') status?: string,
    @Query('type') type?: string,
  ) {
    return this.service.findAll(parseInt(page, 10), parseInt(limit, 10), status, type);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get service request details and audit history timeline' })
  async findOne(@Param('id') id: string) {
    const item = await this.service.findOne(id);
    if (!item) throw new NotFoundException(`Request ${id} not found`);
    return item;
  }
}

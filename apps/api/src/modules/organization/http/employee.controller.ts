import { Controller, Get, Param, Query, NotFoundException } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiParam } from '@nestjs/swagger';
import { EmployeeService } from '../application/employee.service';
import { EmployeeQueryDto } from './employee-query.dto';

@ApiTags('Employees')
@Controller('api/employees')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Get()
  @ApiOperation({ summary: 'List employees with pagination and filters (Phase A: Read-Only)' })
  async findAll(@Query() query: EmployeeQueryDto) {
    return this.employeeService.findAll(query.page, query.limit, query.department, query.search);
  }

  @Get(':idOrLegacyId')
  @ApiOperation({ summary: 'Get employee by UUID or legacy ID (Phase A: Read-Only)' })
  @ApiParam({ name: 'idOrLegacyId', description: 'UUID or legacy employee ID (e.g. OP-1)' })
  async findOne(@Param('idOrLegacyId') idOrLegacyId: string) {
    const employee = await this.employeeService.findOne(idOrLegacyId);
    if (!employee) {
      throw new NotFoundException(`Employee '${idOrLegacyId}' not found`);
    }
    return employee;
  }
}

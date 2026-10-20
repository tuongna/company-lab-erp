import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { EmployeeEntity } from '../domain/employee.entity';
import { byIdOrLegacyId } from '../../../common/utils/identifier.util';

@Injectable()
export class EmployeeService {
  constructor(private readonly dataSource: DataSource) {}

  async findAll(page = 1, limit = 20, department?: string, search?: string) {
    const repo = this.dataSource.getRepository(EmployeeEntity);
    const qb = repo
      .createQueryBuilder('emp')
      .orderBy('emp.name', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    if (department) {
      qb.andWhere('emp.department = :department', { department });
    }

    if (search) {
      qb.andWhere('(emp.name ILIKE :search OR emp.email ILIKE :search)', {
        search: `%${search}%`,
      });
    }

    const [items, total] = await qb.getManyAndCount();
    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(idOrLegacyId: string): Promise<EmployeeEntity | null> {
    const repo = this.dataSource.getRepository(EmployeeEntity);
    const where = byIdOrLegacyId(idOrLegacyId);

    return repo.findOne({ where });
  }

  async findByEmail(email: string): Promise<EmployeeEntity | null> {
    const repo = this.dataSource.getRepository(EmployeeEntity);
    return repo.findOne({
      where: { email: email.toLowerCase().trim() },
    });
  }
}

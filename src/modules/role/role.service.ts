import { Injectable } from '@nestjs/common';
import { Role } from './role.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EntityCondition } from '../../utils/types/entity-condition.type';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { NotFound } from '../../errors/NotFound';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async getRole(where: EntityCondition<Role>): Promise<Role> {
    const result = await this.roleRepository.findOneBy(where);
    if (!result) {
      throw new NotFound('role_not_found');
    }
    return result;
  }

  listRoles(): Promise<Role[]> {
    return this.roleRepository.find();
  }

  count(where: EntityCondition<Role>): Promise<number> {
    return this.roleRepository.count({ where });
  }

  create(createRoleDto: CreateRoleDto): Promise<Role> {
    return this.roleRepository.save(this.roleRepository.create(createRoleDto));
  }

  async update(
    where: EntityCondition<Role>,
    updateRoleDto: UpdateRoleDto,
  ): Promise<Role> {
    const existingRole: Role = await this.getRole(where);

    Object.assign(existingRole, updateRoleDto);
    return this.roleRepository.save(existingRole);
  }

  async delete(id: Role['id']): Promise<Role> {
    const role = await this.getRole({ id });
    return this.roleRepository.softRemove(role);
  }
}

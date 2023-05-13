import { Injectable } from '@nestjs/common';
import { CreateRoleInput } from './dto/create-role.input';
import { UpdateRoleInput } from './dto/update-role.input';
import { Role } from './entities/role.entity';
import { Context } from '../common/context';
import { BaseService } from '../common/base.service';
import { RoleCodesEnum } from './role.enum';

@Injectable()
export class RoleService extends BaseService {
  create(createRoleInput: CreateRoleInput) {
    return 'This action adds a new role';
  }

  @Context()
  findAll(): Promise<Role[]> {
    const { trx } = this.ctx;
    return Role.query(trx);
  }

  findOne(id: number) {
    return `This action returns a #${id} role`;
  }

  update(id: number, updateRoleInput: UpdateRoleInput) {
    return `This action updates a #${id} role`;
  }

  remove(id: number) {
    return `This action removes a #${id} role`;
  }

  async getRoleCodeToIdMap(): Promise<Map<RoleCodesEnum, number>> {
    const { trx } = this.ctx;
    const roles = await Role.query(trx);
    return new Map(roles.map((r) => [r.code, r.id]));
  }

  async getRoleIdToCodeToMap(): Promise<Map<number, RoleCodesEnum>> {
    const { trx } = this.ctx;
    const roles = await Role.query(trx);
    return new Map(roles.map((r) => [r.id, r.code]));
  }
}

import { Injectable } from '@nestjs/common';
import { Permission, PermissionsAndRolesResult, PermissionsByGroup } from './entities/permission.entity';
import { UpdateRolePermissionInput } from './dto/update-role-permission.input';
import { PermissionGroup, permissionToPermissionGroupMap } from './permission.enum';
import {
  PermissionGroupNotSetForPermissionException,
  PermissionNotFoundException,
  RoleNotFoundException,
} from '../common/exceptions';
import { Role } from '../role/entities/role.entity';
import { Context } from '../common/context';
import { BaseService } from '../common/base.service';
import { getOrThrow } from '../util/guards';
import { PermissionEvents } from './events';
import { RoleCodesEnum } from '../role/role.enum';

@Injectable()
export class PermissionService extends BaseService {
  @Context()
  findAll(): Promise<Permission[]> {
    const { trx } = this.ctx;
    return Permission.query(trx).withGraphFetched('roles');
  }

  @Context()
  findOne(id: number): Promise<Permission> {
    const { trx } = this.ctx;
    return getOrThrow(
      async () => Permission
        .query(trx)
        .withGraphFetched('roles')
        .findById(id),
      new PermissionNotFoundException(),
    );
  }

  @Context()
  findByIds(ids: number[]): Promise<Permission[]> {
    const { trx } = this.ctx;
    return getOrThrow(
      async () => Permission
        .query(trx)
        .withGraphFetched('roles')
        .findByIds(ids),
      new PermissionNotFoundException(),
    );
  }

  @Context()
  async permissionsByGroupsWithRoles(): Promise<PermissionsAndRolesResult> {
    const { trx } = this.ctx;
    const permissions = await Permission
      .query(trx)
      .orderBy([
        { column: 'group' }, { column: 'code' },
      ]);

    const filteredRoleCodes = Object.values(RoleCodesEnum)
      .filter((code) => ![RoleCodesEnum.admin].includes(code));

    const rolesWithPermissions = await Role
      .query(trx)
      .whereIn('code', filteredRoleCodes)
      .orderBy('code')
      .withGraphFetched('permissions');

    const rolesWithPermissionIds = rolesWithPermissions.map((role) => ({
      id: role.id,
      name: role.name,
      code: role.code,
      permissionIds: role.permissions.map(({ id }) => id),
    }));

    const permissionGroups = permissions.reduce<PermissionsByGroup[]>((
      prev: PermissionsByGroup[],
      perm,
    ) => {
      let permissionGroup: Partial<PermissionsByGroup> = {
        permissions: [],
      };
      const group: PermissionGroup = permissionToPermissionGroupMap.get(perm.code);

      if (!group) {
        return prev;
      }

      if (prev.length && prev[prev.length - 1].code === group.code) {
        permissionGroup = prev[prev.length - 1];
      } else {
        if (!group) {
          throw new PermissionGroupNotSetForPermissionException(perm.code);
        }

        permissionGroup = {
          code: group.code,
          name: group.name,
          permissions: [],
        };
        prev.push(permissionGroup as PermissionsByGroup);
      }

      permissionGroup.permissions.push({
        id: perm.id,
        name: perm.name,
        code: perm.code,
      });

      return prev;
    }, []);

    return {
      groups: permissionGroups,
      roles: rolesWithPermissionIds,
    };
  }

  @Context()
  async updateRolePermission(input: UpdateRolePermissionInput): Promise<Permission[]> {
    const { trx } = this.ctx;

    const role = await Role
      .query(trx)
      .withGraphFetched('permissions')
      .findOne('code', input.roleCode);

    if (!role) {
      throw new RoleNotFoundException(input.roleCode);
    }

    if (input.enabled) {
      await role.$relatedQuery('permissions', trx).relate(input.permissionIds);
    } else {
      await role
        .$relatedQuery('permissions', trx)
        .unrelate()
        .where((builder) => builder.whereIn('permission.id', input.permissionIds));
    }

    const permissions = await this.findByIds(input.permissionIds);
    await this.emit(PermissionEvents.PERMISSION_CHANGED, {
      permissions,
      roleId: role.id,
      enabled: input.enabled,
      initiatorId: this.ctx.user.id,
    });

    return permissions;
  }

  @Context()
  async getPermissionsByUserRoles(ids: number[]): Promise<Role[]> {
    const { trx } = this.ctx;
    return Role
      .query(trx)
      .whereIn('id', ids)
      .withGraphFetched('permissions');
  }
}

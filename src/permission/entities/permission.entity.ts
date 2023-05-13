import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Model } from 'objection';
import BaseModel from '../../common/base.model';
import {
  PermissionEnum,
  PermissionGroup,
  PermissionGroupEnum,
  permissionToPermissionGroupMap,
} from '../permission.enum';
import { Role } from '../../role/entities/role.entity';
import { RoleCodesEnum } from '../../role/role.enum';
import { PermissionGroupNotSetForPermissionException } from '../../common/exceptions';

@ObjectType()
export class Permission extends BaseModel {
  static get tableName() {
    return 'permission';
  }

  @Field(() => Int, { description: 'Permission id' })
  id: number;

  @Field(() => PermissionEnum, { description: 'Permission code' })
  code: PermissionEnum;

  @Field(() => PermissionGroupEnum, { description: 'Permission group code' })
  group(): PermissionGroupEnum {
    const group: PermissionGroup = permissionToPermissionGroupMap.get(this.code);
    if (!group) {
      throw new PermissionGroupNotSetForPermissionException(this.code);
    }
    return group.code;
  }

  @Field({ description: 'Permission name' })
  name: string;

  @Field(() => [Role], { description: 'Roles with this permission' })
  roles: Role[];

  static get relationMappings() {
    return {
      roles: {
        relation: Model.ManyToManyRelation,
        modelClass: Role,
        join: {
          from: 'permission.id',
          through: {
            from: 'role_permission.permission_id',
            to: 'role_permission.role_id',
          },
          to: 'role.id',
        },
      },
    };
  }
}

@ObjectType()
export class PermissionsByGroup {
  @Field(() => PermissionGroupEnum, { description: 'Permission group code' })
  code: PermissionGroupEnum;

  @Field({ description: 'Permission group name' })
  name: string;

  @Field(() => [Permission], { description: 'Permissions in the group' })
  permissions: Pick<Permission, 'id' | 'name' | 'code'>[];
}

@ObjectType()
export class PermissionsRoles {
  @Field(() => Int, { description: 'Role id' })
  id: number;

  @Field(() => RoleCodesEnum, { description: 'Role code' })
  code: RoleCodesEnum;

  @Field({ description: 'Role name' })
  name: string;

  @Field(() => [Int], { description: 'permission ids' })
  permissionIds: number[];
}

@ObjectType()
export class PermissionsAndRolesResult {
  @Field(() => [PermissionsRoles], { description: 'Role with permission ids' })
  roles: PermissionsRoles[];

  @Field(() => [PermissionsByGroup])
  groups: PermissionsByGroup[];
}

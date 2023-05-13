import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Model } from 'objection';
import BaseModel from '../../common/base.model';
import { Permission } from '../../permission/entities/permission.entity';
import { RoleCodesEnum } from '../role.enum';

@ObjectType()
export class Role extends BaseModel {
  static get tableName() {
    return 'role';
  }

  @Field(() => Int, { description: 'Role id' })
  id: number;

  @Field(() => RoleCodesEnum, { description: 'Role code' })
  code: RoleCodesEnum;

  @Field({ description: 'Role name' })
  name: string;

  @Field(() => [Permission], { description: 'Role permissions', nullable: true })
  permissions?: Permission[];

  @Field(() => [Int], { description: 'permission ids' })
  permissionIds: number[];

  static get relationMappings() {
    return {
      permissions: {
        relation: Model.ManyToManyRelation,
        modelClass: Permission,
        join: {
          from: 'role.id',
          through: {
            from: 'role_permission.role_id',
            to: 'role_permission.permission_id',
          },
          to: 'permission.id',
        },
      },
    };
  }
}

import { Field, ObjectType } from '@nestjs/graphql';
import { Model } from 'objection';
import * as crypto from 'crypto';
import BaseModel from '../../common/base.model';
import { Role } from '../../role/entities/role.entity';
import { PermissionEnum } from '../../permission/permission.enum';
import { UserGenderEnum, UserStatusEnum } from '../user.enum';
import { Permission } from '../../permission/entities/permission.entity';

export const USER_TABLE_NAME = 'user';

@ObjectType('UserType')
// TODO: попробовал объединить Entity (для graphql) и Model (для дб) так как по сути набор полей один и тот же
export class User extends BaseModel {
  static get tableName() {
    return USER_TABLE_NAME;
  }

  @Field({ description: 'User id' })
  id: string;

  @Field({ description: 'User first name' })
  firstName: string;

  @Field({ description: 'Level of Avatar' })
  level: number; // float

  @Field({ description: 'User last name' })
  lastName: string;

  @Field({ description: 'Color of avatar, RGB' })
  color: string; // ff0000

  @Field({ nullable: true, description: 'User middle name' })
  middleName?: string;

  @Field({ nullable: true, description: 'The name of avatar' })
  login?: string;

  @Field({ description: 'User email' })
  email: string;

  @Field({ description: 'User phone' })
  phone: string;

  @Field(() => UserGenderEnum)
  gender: UserGenderEnum;

  @Field(() => UserStatusEnum, { description: 'User status' })
  status: UserStatusEnum;

  @Field({ description: 'User created timestamp' })
  created: string;

  @Field({ description: 'User updated timestamp' })
  updated: string;

  @Field(() => [Role], { description: 'User roles' })
  roles: Role[];

  @Field({ description: 'true if the password was set by user' })
  passwordSetByUser: boolean;

  permissions: Set<PermissionEnum>;

  salt: string;

  pwd: string;

  @Field({ description: 'User comment', nullable: true })
  comment?: string;

  @Field({ nullable: true })
  telegramId?: string;

  static hashPassword = (salt, password) => new Promise<string>((resolve, reject) => {
    const defaultIterations = 10000;
    const defaultKeyLength = 64;

    return crypto.pbkdf2(
      password,
      salt,
      defaultIterations,
      defaultKeyLength,
      'sha1',
      (err, key) => {
        if (err) reject(err);
        resolve(key.toString('base64'));
      },
    );
  });

  fullName() {
    return `${this.firstName} ${this.lastName}`;
  }

  $afterFind(queryContext) {
    const allPermissionsSet = new Set<PermissionEnum>();
    this.roles?.forEach((r: Role) => r.permissions.forEach((p: Permission) => allPermissionsSet.add(p.code)));
    this.permissions = allPermissionsSet;
  }

  // Optional JSON schema. This is not the database schema!
  // No tables or columns are generated based on this. This is only
  // used for input validation. Whenever a model instance is created
  // either explicitly or implicitly it is checked against this schema.
  // See http://json-schema.org/ for more info.
  static get jsonSchema() {
    return {
      type: 'object',
      required: ['firstName', 'lastName'],

      properties: {
        id: { type: 'string' },
        firstName: { type: 'string', minLength: 1, maxLength: 255 },
        lastName: { type: 'string', minLength: 1, maxLength: 255 },
        telegramId: { type: ['string', 'null'] },
      },
    };
  }

  // This object defines the relations to other models.
  static get relationMappings() {
    return {
      roles: {
        relation: Model.ManyToManyRelation,
        modelClass: Role,
        join: {
          from: 'user.id',
          through: {
            from: 'user_role.user_id',
            to: 'user_role.role_id',
          },
          to: 'role.id',
        },
      },
    };
  }
}

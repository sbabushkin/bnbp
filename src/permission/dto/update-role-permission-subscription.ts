import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Permission } from '../entities/permission.entity';

@ObjectType()
export class UpdateRolePermissionSubscriptionType {
  @Field(() => [Permission])
  permissions: Permission[];

  @Field(() => Int)
  roleId: number;

  @Field()
  enabled: boolean;

  @Field()
  initiatorId: string;
}

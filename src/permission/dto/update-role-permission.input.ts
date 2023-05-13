import { Field, InputType, Int } from '@nestjs/graphql';
import { RoleCodesEnum } from '../../role/role.enum';

@InputType()
export class UpdateRolePermissionInput {
  @Field(() => RoleCodesEnum)
  roleCode: RoleCodesEnum;

  @Field(() => [Int])
  permissionIds: number[];

  @Field()
  enabled: boolean;
}

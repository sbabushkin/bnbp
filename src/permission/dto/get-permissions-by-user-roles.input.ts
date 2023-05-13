import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class GetPermissionsByUserRolesInput {
  @Field(() => [Int])
  roleIds: number[];
}

import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class TokenPairType {
  @Field(() => String, { nullable: true })
  refreshToken?: string;

  @Field()
  accessToken: string;
}

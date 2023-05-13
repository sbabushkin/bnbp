import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class RefreshTokensInput {
  @Field()
  refreshToken: string;

  @Field()
  deviceId: string;
}

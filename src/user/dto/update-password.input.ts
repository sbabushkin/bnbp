import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class UpdatePasswordInput {
  @Field()
  email: string;

  @Field()
  requestId: string;

  @Field()
  pwd: string;
}

@InputType()
export class CheckRecoveryHashInput {
  @Field()
  email: string;

  @Field()
  requestId: string;
}

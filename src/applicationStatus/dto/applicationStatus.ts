import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ApplicationStatusReturnType {
  @Field({ nullable: true })
  isDevelopment?: boolean;
}

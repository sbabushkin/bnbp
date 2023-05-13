import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class SentCodeEntity {
  @Field({ description: 'User phone' })
  phone: string;

  @Field({ description: 'Status of sending' })
  status: boolean;
}

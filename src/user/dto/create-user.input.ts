import { Field, InputType, Int } from '@nestjs/graphql';
import { UserGenderEnum } from '../user.enum';

@InputType()
export class CreateUserInput {
  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field({ nullable: true })
  middleName?: string;

  @Field({ nullable: true })
  login?: string;

  @Field()
  email: string;

  @Field()
  phone: string;

  @Field(() => UserGenderEnum, { nullable: true })
  gender?: UserGenderEnum;

  @Field(() => [Int])
  roleIds: number[];

  @Field({ nullable: true })
  comment?: string;

  @Field({ nullable: true })
  telegramId?: string;
}

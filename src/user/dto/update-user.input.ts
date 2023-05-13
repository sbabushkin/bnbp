import {
  Field, InputType, Int,
} from '@nestjs/graphql';
import { UserGenderEnum, UserStatusEnum } from '../user.enum';

@InputType()
export class UpdateUserInput {
  @Field()
  id: string;

  @Field(() => UserStatusEnum, { description: 'User status', nullable: true })
  status?: UserStatusEnum;

  @Field({ nullable: true })
  firstName?: string;

  @Field({ nullable: true })
  lastName?: string;

  @Field({ nullable: true })
  middleName?: string;

  @Field({ nullable: true })
  login?: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  phone?: string;

  @Field(() => UserGenderEnum, { nullable: true })
  gender?: UserGenderEnum;

  @Field(() => [Int], { nullable: true })
  roleIds?: number[];

  @Field({ nullable: true })
  comment?: string;

  @Field({ nullable: true })
  telegramId?: string;
}

import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { ErrorMessages } from '../../common/errorCodes';

@InputType()
export class UserLoginInput {
  @Field()
  @IsEmail({}, {
    message: ErrorMessages.isEmail,
  })
  email: string;

  @Field()
  @IsNotEmpty({
    message: ErrorMessages.isNotEmpty,
  })
  password: string;

  @Field(() => String, { nullable: true })
  deviceId?: string;
}

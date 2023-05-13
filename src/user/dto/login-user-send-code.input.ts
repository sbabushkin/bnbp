import { Field, InputType } from '@nestjs/graphql';
import { IsPhoneNumber } from 'class-validator';
import { ErrorMessages } from '../../common/errorCodes';

@InputType()
export class UserLoginSendCodeInput {
  @Field()
  @IsPhoneNumber('RU', {
    message: ErrorMessages.isPhoneNumber,
  })
  phone: string;
}

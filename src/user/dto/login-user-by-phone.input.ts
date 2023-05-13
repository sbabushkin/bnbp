import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsPhoneNumber, Length } from 'class-validator';
import { ErrorMessages } from '../../common/errorCodes';

@InputType()
export class UserLoginByPhoneInput {
  @Field()
  @IsPhoneNumber('RU', {
    message: ErrorMessages.isPhoneNumber,
  })
  @Length(11, 11)
  phone: string;

  @Field()
  @IsNotEmpty({
    message: ErrorMessages.isNotEmpty,
  })
  @Length(4, 4)
  code: string;

  @Field(() => String, { nullable: true })
  deviceId?: string;
}

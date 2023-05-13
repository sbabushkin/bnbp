import { ObjectType, Field } from '@nestjs/graphql';
import { Role } from '../../role/entities/role.entity';

@ObjectType()
export class LoggedUser {
  @Field({ description: 'User id' })
  id: string;

  @Field({ description: 'User first name' })
  firstName: string;

  @Field({ description: 'User last name' })
  lastName: string;

  @Field({ description: 'User middle name' })
  middleName: string;

  @Field({ description: 'User email' })
  email: string;

  @Field({ description: 'User access token' })
  accessToken?: string;

  @Field({ description: 'User refresh token', nullable: true })
  refreshToken?: string;

  @Field(() => [Role], { description: 'User roles' })
  roles: Role[];
}

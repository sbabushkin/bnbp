import { registerEnumType } from '@nestjs/graphql';

export enum UserStatusEnum {
  new = 'new',
  active = 'active',
  deleted = 'deleted',
  // todo еще статусов?
}

registerEnumType(UserStatusEnum, {
  name: 'UserStatusEnum',
});

export enum UserGenderEnum {
  male = 'male',
  female = 'female',
}

registerEnumType(UserGenderEnum, {
  name: 'UserGenderEnum',
});

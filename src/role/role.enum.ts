import { registerEnumType } from '@nestjs/graphql';

export enum RoleCodesEnum {
  system = 'SY',
  admin = 'AM',
  user = 'UR',
}

export const RoleRuMap = {
  [RoleCodesEnum.system]: 'System', // System
  [RoleCodesEnum.admin]: 'Admin', // Admin
  [RoleCodesEnum.user]: 'User', // User
};

registerEnumType(RoleCodesEnum, {
  name: 'RoleCodesEnum',
  description: 'Role Code Enum',
});

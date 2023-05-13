import { PermissionEnum, PermissionGroupEnum } from '../../permission/permission.enum';

export const permissionSeed = [
  // extra users permissions
  {
    id: 1,
    code: PermissionEnum.CAN_VIEW_USERS_ANY,
    name: 'Может просматривать список всех пользователей',
    group: PermissionGroupEnum.USER,
  },
  {
    id: 2,
    code: PermissionEnum.CAN_VIEW_USERS_OWN,
    name: 'Может просматривать список своих пользователей',
    group: PermissionGroupEnum.USER,
  },
];





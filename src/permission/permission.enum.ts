import { registerEnumType } from '@nestjs/graphql';

export enum PermissionGroupEnum {
  USER = 'USER',
  PERMISSION = 'PERMISSION',
}

export enum PermissionEnum {
  CAN_VIEW_USERS_ANY = 'CAN_VIEW_USERS_ANY',
  CAN_VIEW_USERS_OWN = 'CAN_VIEW_USERS_OWN',
  CAN_VIEW_USERS = 'CAN_VIEW_USERS',
  CAN_EDIT_USERS = 'CAN_EDIT_USERS',
  CAN_VIEW_PERMISSIONS = 'CAN_VIEW_PERMISSIONS',
  CAN_EDIT_PERMISSIONS = 'CAN_EDIT_PERMISSIONS',
}

registerEnumType(PermissionEnum, {
  name: 'PermissionEnum',
  description: 'Permission Enum',
});

registerEnumType(PermissionGroupEnum, {
  name: 'PermissionGroupEnum',
});

export class PermissionGroup {
  static readonly User = new PermissionGroup(PermissionGroupEnum.USER, 'Пользователи');

  static readonly Permission = new PermissionGroup(PermissionGroupEnum.PERMISSION, 'Разрешения пользователей');

  private constructor(code: PermissionGroupEnum, name: string) {
    this.code = code;
    this.name = name;
  }

  code: PermissionGroupEnum;

  name: string;
}

// Maps permission group to permission. Can be replaced with db table in the future
export const permissionToPermissionGroupMap: ReadonlyMap<PermissionEnum, PermissionGroup> =
  new Map<PermissionEnum, PermissionGroup>([
    // user
    [PermissionEnum.CAN_VIEW_USERS_ANY, PermissionGroup.User],
    [PermissionEnum.CAN_VIEW_USERS_OWN, PermissionGroup.User],
    [PermissionEnum.CAN_VIEW_USERS, PermissionGroup.User],
    [PermissionEnum.CAN_EDIT_USERS, PermissionGroup.User],
    // permission
    [PermissionEnum.CAN_VIEW_PERMISSIONS, PermissionGroup.Permission],
    [PermissionEnum.CAN_EDIT_PERMISSIONS, PermissionGroup.Permission],
  ]);

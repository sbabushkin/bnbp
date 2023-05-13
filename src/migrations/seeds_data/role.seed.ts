import { RoleCodesEnum, RoleRuMap } from '../../role/role.enum';

export const roleSeed = [
  { id: 1, code: RoleCodesEnum.system, name: RoleRuMap[RoleCodesEnum.system] },
  { id: 2, code: RoleCodesEnum.admin, name: RoleRuMap[RoleCodesEnum.admin] },
  { id: 3, code: RoleCodesEnum.user, name: RoleRuMap[RoleCodesEnum.user] },
];

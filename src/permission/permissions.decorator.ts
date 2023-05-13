import { SetMetadata, applyDecorators } from '@nestjs/common';
import { PermissionEnum } from './permission.enum';
import BaseModel from '../common/base.model';

export class PermissionsOpts {
  model: typeof BaseModel;

  idExtractor?: Function;

  checkFields?: boolean = false;

  inputArgName?: string;
}

export const PERMISSIONS_KEY = 'permissions';
export const PERMISSIONS_OPTS_KEY = 'permissions_opts';
export const Permissions = (
  permissions: PermissionEnum | PermissionEnum[],
  opts?: PermissionsOpts,
) => applyDecorators(
  SetMetadata(PERMISSIONS_KEY, Array.isArray(permissions) ? permissions : [permissions]),
  SetMetadata(PERMISSIONS_OPTS_KEY, opts),
);

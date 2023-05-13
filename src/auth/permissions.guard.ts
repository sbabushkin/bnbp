import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { PermissionEnum } from '../permission/permission.enum';
import { RoleCodesEnum } from '../role/role.enum';
import { getRequest } from './common';
import { PERMISSIONS_KEY, PERMISSIONS_OPTS_KEY, PermissionsOpts } from '../permission/permissions.decorator';
import { TenantForbidden } from '../common/exceptions/tenant.exception';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = getRequest(context);
    const ctx = GqlExecutionContext.create(context);
    const args = ctx.getArgs();

    let permissionsCheck = true;
    const isAdmin = req.user?.roles.some((r) => r.code === RoleCodesEnum.admin);

    const requiredPermissions = this.reflector
      .getAllAndOverride<PermissionEnum[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const permissionsOpts = this.reflector
      .getAllAndOverride<PermissionsOpts>(PERMISSIONS_OPTS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (requiredPermissions) {
      permissionsCheck = isAdmin || requiredPermissions.some((perm) => req.user.permissions.has(perm));
    }

    if (permissionsOpts) {
      const {
        model, idExtractor, checkFields, inputArgName,
      } = permissionsOpts;
      const input: any = args[inputArgName || 'input'];

      const forbiddenFields = [];

      if (input && model) {
        const id: any = idExtractor ? idExtractor(input) : input.id;
        const idArray = Array.isArray(id) ? id : [id];
        const entities: any[] = await model.query().whereIn('id', idArray);

        for (const entity of entities) {
          if (entity.tenantId && !(req.user?.tenantIds || []).includes(entity.tenantId)) {
            throw new TenantForbidden();
          }

          // if (checkFields) {
          //   const filedPermissionMap = entityFieldPermissionMap[model.tableName];
          //
          //   if (filedPermissionMap) {
          //     for (const field of Object.keys(input)) {
          //       // if value of field changes and field permission exists
          //       const hasPerm = req.user.permissions.has(filedPermissionMap[field]);
          //       if ((entity[field] !== input[field]) && filedPermissionMap[field] && !hasPerm) {
          //         forbiddenFields.push(field);
          //       }
          //     }
          //   }
          // }
        }
      }

      if (forbiddenFields.length) {
        // throw new TaskFieldsForbidden(forbiddenFields);
      }
    }

    return permissionsCheck;
  }
}

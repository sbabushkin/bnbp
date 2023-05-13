import {
  Args, Mutation, Query, Resolver, Subscription,
} from '@nestjs/graphql';
import { Inject, UseGuards } from '@nestjs/common';
import { PubSubEngine } from 'graphql-subscriptions/dist/pubsub-engine';
import { PermissionService } from './permission.service';
import {
  Permission,
  PermissionsAndRolesResult,
} from './entities/permission.entity';
import { JwtAuthGuard, NoAuth } from '../auth/auth-jwt.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { Permissions } from './permissions.decorator';
import { PermissionEnum } from './permission.enum';
import { UpdateRolePermissionInput } from './dto/update-role-permission.input';
import { Role } from '../role/entities/role.entity';
import { GetPermissionsByUserRolesInput } from './dto/get-permissions-by-user-roles.input';
import { PUBSUB } from '../pubsub/pubsub.module';
import { PermissionEvents } from './events';
import { UpdateRolePermissionSubscriptionType } from './dto/update-role-permission-subscription';

@Resolver(() => Permission)
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PermissionResolver {
  constructor(
    private readonly permissionService: PermissionService,
    @Inject(PUBSUB) private pubSub: PubSubEngine,
  ) {}

  @Query(() => PermissionsAndRolesResult)
  @Permissions(PermissionEnum.CAN_VIEW_PERMISSIONS)
  permissionsByGroupsWithRoles(): Promise<PermissionsAndRolesResult> {
    return this.permissionService.permissionsByGroupsWithRoles();
  }

  @Mutation(() => [Permission])
  @Permissions(PermissionEnum.CAN_EDIT_PERMISSIONS)
  updateRolePermission(@Args('input') input: UpdateRolePermissionInput): Promise<Permission[]> {
    return this.permissionService.updateRolePermission(input);
  }

  @Query(() => [Role])
  @NoAuth()
  getPermissionsByUserRoles(@Args('input') input: GetPermissionsByUserRolesInput): Promise<Role[]> {
    return this.permissionService.getPermissionsByUserRoles(input.roleIds);
  }

  @Subscription(() => UpdateRolePermissionSubscriptionType, {
    resolve(value) {
      return value;
    },
  })
  @NoAuth()
  permissionChanged() {
    return this.pubSub.asyncIterator(PermissionEvents.PERMISSION_CHANGED);
  }
}

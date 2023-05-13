import { Args, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/auth-jwt.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { Permissions } from '../permission/permissions.decorator';
import { PermissionEnum } from '../permission/permission.enum';
import { EventService } from './event.service';
import { Event } from './entities/event.entity';
import { GetEventsInput } from './dto/get-events.input';

@Resolver(() => Event)
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class EventResolver {
  constructor(private readonly eventService: EventService) {
  }

  @Query(() => [Event])
  // @Permissions(PermissionEnum.CAN_VIEW_TASKS_EVENTS)
  // @Permissions(PermissionEnum.CAN_VIEW_PROJECT_EVENTS)
  getEvents(@Args('input') input: GetEventsInput)
    : Promise<Event[]> {
    return this.eventService.getEvents(input);
  }
}

import { Injectable } from '@nestjs/common';
import { Event } from './entities/event.entity';
import { BaseService } from '../common/base.service';
import { Context } from '../common/context';
import { GetEventsInput } from './dto/get-events.input';

@Injectable()
export class EventService extends BaseService {
  private offset: number = 0;

  private limit: number = 50;

  @Context()
  getEvents(input: GetEventsInput): Promise<Event[]> {
    const events = Event.query(this.logCon)
      .where('entity_id', input.entityId)
      .orWhere('aggregate_id', input.entityId)
      .limit(input.limit || this.limit)
      .offset(input.offset || this.offset)
      .orderBy('created', 'DESC');

    if (input.eventsTypes?.length) {
      events.whereIn('type', input.eventsTypes);
    }

    return events;
  }
}

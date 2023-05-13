import { User } from '../user/entities/user.entity';

export class Event {
  public id: string;

  public type: string;

  public created: string;

  public payload: any;

  public user: User;

  public aggregateId: string;

  public userId: string;

  public diff: any;

  public pubSubOnly: boolean;

  constructor(
    id: string,
    type: string,
    created: string,
    payload: any,
    user: User = undefined,
    aggregateId: string = null,
    diff: any,
    pubSubOnly: boolean,
  ) {
    this.id = id;
    this.type = type;
    this.created = created;
    this.payload = payload;
    this.user = user;
    this.userId = user.id;
    this.aggregateId = aggregateId;
    this.diff = diff;
    this.pubSubOnly = pubSubOnly;
  }
}

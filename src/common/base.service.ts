import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { PubSubEngine } from 'graphql-subscriptions/dist/pubsub-engine';
import { TransactionOrKnex } from 'objection';
import { Connection } from '@willsoto/nestjs-objection';
import { v4 as uuid } from 'uuid';
import { omit } from 'lodash';
import { ConfigService } from '@nestjs/config';
import { User } from '../user/entities/user.entity';
import { Event } from './event';
import { PUBSUB } from '../pubsub/pubsub.module';
import { generateArray } from '../util/array';
import { Event as EventModel } from '../event/entities/event.entity';
import { PubSubConfig, TestConfig } from '../config/base.config';
import { PubSubPayloadSizeTooLargeException } from './exceptions/pubSub.exception';

export interface IServiceContext {
  date: string;
  trx: any;
  user: User;
  eventBuffer: Event[];
}

export interface IBaseService {
  setupContext(context?: IServiceContext): IServiceContext;

  getContext(): IServiceContext;

  flush(): Promise<Event[]>;

  emit(eventType: string, eventData: any): void;
}

@Injectable({ scope: Scope.REQUEST })
export abstract class BaseService implements IBaseService {
  protected ctx: IServiceContext;

  @Inject(REQUEST) private readonly request: any;

  @Inject(PUBSUB) private readonly pubSub: PubSubEngine;

  @Inject('log') protected readonly logCon: Connection;

  @Inject() protected readonly configService: ConfigService;

  public setupContext(context?: IServiceContext): IServiceContext {
    if (this.ctx) {
      return this.ctx;
    }

    const intContext = context;
    intContext.user = context.user || this.request?.req?.user;
    this.ctx = intContext;

    Object.keys(this)
      .filter((property) => this[property] instanceof BaseService)
      .forEach((property) => this[property].setupContext(intContext));

    return intContext;
  }

  public emit(eventType: string, eventData: any, aggregateId?: string, diff?: any, pubSubOnly?: boolean): Event {
    const user: any = omit(this.ctx.user, ['pwd', 'salt', 'permissions']);

    const newEvent = new Event(
      uuid(),
      eventType,
      this.ctx.date,
      eventData,
      user,
      aggregateId,
      diff,
      pubSubOnly,
    );

    this.ctx?.eventBuffer?.push(newEvent);

    return newEvent;
  }

  public async flush(): Promise<Event[]> {
    const result = this.ctx.eventBuffer;
    const insertResult = result.filter((event) => event.pubSubOnly !== true);

    const testConfig = this.configService.get<TestConfig>('testConfig');
    const { payloadMaxSize } = this.configService.get<PubSubConfig>('pubSub');

    this.ctx.eventBuffer = [];

    for (const event of result) {
      const size = Buffer.byteLength(JSON.stringify(event.payload), 'utf8');

      if (size > payloadMaxSize) {
        throw new PubSubPayloadSizeTooLargeException();
      }

      // await this.pubSub.publish(event.type, { ...event.payload, user: event.user });
    }

    if (result.length && !testConfig.isTest) {
      await EventModel.query(this.logCon).insert(insertResult.map((event) => ({
        ...event,
        entityId: event?.diff?.id || null,
      })));
    }

    return result;
  }

  public getContext(): IServiceContext {
    return this.ctx;
  }

  protected async countRowsInTable(trxOrKnex: TransactionOrKnex, tableName: string): Promise<number> {
    const res = await trxOrKnex.raw(`select count(*)
                                     from ${tableName};`);
    return parseInt(res.rows[0].count, 10);
  }

  protected async generateNextNames(length: number): Promise<string[]> {
    const { trx } = this.ctx;
    const [tableName, name] = this.nextEntityNameAndTableName();
    const count = await this.countRowsInTable(trx, tableName);
    return generateArray(length, (index) => `${name} ${count + index + 1}`);
  }

  protected async generateNextName(): Promise<string> {
    const names = await this.generateNextNames(1);
    return names[0];
  }

  protected nextEntityNameAndTableName(): [string, string] {
    throw 'You must override this method to generate entities names';
  }
}

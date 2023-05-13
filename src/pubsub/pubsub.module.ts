import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
// import { PubSub } from 'graphql-subscriptions';
// import { KafkaPubsub } from './kafka.pubsub';

export const PUBSUB = 'PUBSUB';

const pubSubFactory = {
  provide: PUBSUB,
  imports: [ConfigModule],
  useFactory: (configService: ConfigService) => {
    const options = configService.get('pubSub');
    // if (options.inMemory) {
    //   return new PubSub();
    // }
    // return new KafkaPubsub(options);
  },
  inject: [ConfigService],
};

@Global()
@Module({
  providers: [pubSubFactory],
  exports: [PUBSUB],
})
export class PubSubModule {}

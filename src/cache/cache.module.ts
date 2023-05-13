import { Module } from '@nestjs/common';
import { RedisModule } from 'nest-module-redis/index';
import { redisConfig } from '../config/redis.config';
import { CacheService, MemoryCacheService} from './cache.service';
import {ConfigService} from '@nestjs/config';
import {TestConfig} from '../config/base.config.type';
import {CACHE_SERVICE} from './decorators/inject-cache.decorator';
import * as Redis from 'ioredis';

@Module({
  providers: [
    CacheService,
    {
      provide: CACHE_SERVICE,
      useFactory: (configService: ConfigService) => {
        const testConfig = configService.get<TestConfig>('testConfig');
        const isLocal = configService.get('isLocal');
        if (testConfig.isTest || isLocal) return new MemoryCacheService();
        return new CacheService(configService);
      },
      inject: [ConfigService],
    },
  ],
  exports: [CacheService, CACHE_SERVICE],
})
export class CacheModule {}

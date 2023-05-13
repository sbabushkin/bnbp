import { Injectable } from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import * as Redis from 'ioredis';
import { RedisConfig } from '../config/base.config.type';

export interface ICacheService {
  get(key: string): Promise<any>;

  set(key: string, value: any): Promise<any>;

  del(key: string): Promise<any>;

  getFields(key: string, fields: string[]): Promise<any[]>;

  setFields(key: string, data: any): Promise<any>;

  getTimeToLive(key: string): Promise<number>;

  setExpiration(key: string, timeSec: number): Promise<void>;

  incrementFieldBy(key: string, field: string, value: number): Promise<number>;
}

@Injectable()
export class CacheService implements ICacheService {
  private redisClient: any;

  constructor(
    private readonly configService: ConfigService,
  ) {
    const config = this.configService.get<RedisConfig>('redis');

    if (config.redisClusterHosts) { // 'host:port,host:port'
      const hosts = config.redisClusterHosts.split(',');
      const nodes = hosts.map((host: string) => {
        const hostArr = host.split(':');
        return { host: hostArr[0], port: +hostArr[1] };
      });
      this.redisClient = new Redis.Cluster(nodes);
    } else {
      this.redisClient = new Redis(
        +config.redisPort,
        config.redisHost,
      );
    }
  }

  async get(key: string): Promise<any> {
    return this.redisClient.get(key);
  }

  async getBuffer(key: string): Promise<any> {
    return this.redisClient.getBuffer(key);
  }

  async set(key: string, value: any): Promise<any> {
    return this.redisClient.set(key, value);
  }

  async del(key: string): Promise<any> {
    return this.redisClient.del(key);
  }

  async getFields(key: string, fields: string[]): Promise<any[]> {
    return this.redisClient.hmget(key, ...fields);
  }

  async setFields(key: string, data: any): Promise<any> {
    return this.redisClient.hmset(key, data);
  }

  async getTimeToLive(key: string): Promise<any> {
    return this.redisClient.ttl(key);
  }

  async setExpiration(key: string, timeSec: number): Promise<any> {
    return this.redisClient.expire(key, timeSec);
  }

  async incrementFieldBy(key: string, field: string, value: number): Promise<number> {
    return this.redisClient.hincrby(key, field, value);
  }
}

@Injectable()
export class MemoryCacheService implements ICacheService {
  private cache = {};

  async get(key: string): Promise<any> {
    return this.cache[key];
  }

  async set(key: string, value: any): Promise<any> {
    this.cache[key] = value;
  }

  async del(key: string): Promise<any> {
    delete this.cache[key];
  }

  async getFields(key: string, fields: string[]): Promise<any[]> {
    const data = this.cache[key];
    const result = [];
    if (data) {
      for (const field of fields) {
        result.push(data[field]);
      }
    }
    return Promise.resolve(result);
  }

  async setFields(key: string, data: any): Promise<any> {
    this.cache[key] = data;
    return Promise.resolve(data);
  }

  async getTimeToLive(key: string): Promise<any> {
    return Promise.resolve(60);
  }

  async setExpiration(key: string, timeSec: number): Promise<any> {
    return Promise.resolve(true);
  }

  async incrementFieldBy(key: string, field: string, value: number): Promise<number> {
    const newValue = +this.cache[key][field] + value;
    this.cache[key][field] = newValue;
    return Promise.resolve(newValue);
  }
}

// TODO добавить реализацию для редиса

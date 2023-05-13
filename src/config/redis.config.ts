export interface IRedisConfig {
  host: string;
  port: number;
  password?: string;
}

export const redisConfig: IRedisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: +process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
};

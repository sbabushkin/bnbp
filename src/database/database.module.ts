import { ObjectionModule } from '@willsoto/nestjs-objection';
import { Module } from '@nestjs/common';
import { knexSnakeCaseMappers } from 'objection';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { types } from 'pg';
import { DatabaseConfig } from '../config/base.config';
import { DatabaseController } from './database.controller';

types.setTypeParser(types.builtins.NUMERIC, parseFloat);

@Module({
  imports: [
    ObjectionModule.registerAsync({
      imports: [ConfigModule],
      name: 'core',
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const dbConfig = config.get<DatabaseConfig>('database');
        const ssl = dbConfig.disableSsl ? false : { rejectUnauthorized: false };

        return {
          // You can specify a custom BaseModel
          // If none is provided, the default Model will be used
          // https://vincit.github.io/objection.js/#models
          // Model: BaseModel,
          name: 'core',
          config: {
            client: dbConfig.client,
            debug: true,
            useNullAsDefault: true,
            pool: {
              min: 2,
              max: dbConfig.poolSize,
              createTimeoutMillis: 3000,
              acquireTimeoutMillis: 30000,
              idleTimeoutMillis: 30000,
              reapIntervalMillis: 1000,
              createRetryIntervalMillis: 100,
            },
            connection: {
              database: dbConfig.dbName,
              user: dbConfig.user,
              password: dbConfig.pwd,
              host: dbConfig.host,
              port: dbConfig.port,
              ssl,
            },
            ...knexSnakeCaseMappers(),
          },
        };
      },

    }),
    ObjectionModule.registerAsync({
      imports: [ConfigModule],
      name: 'log',
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const dbConfig = config.get<DatabaseConfig>('database');
        const ssl = dbConfig.disableSsl ? false : { rejectUnauthorized: false };

        return {
          name: 'log',
          config: {
            client: dbConfig.client,
            debug: true,
            useNullAsDefault: true,
            pool: {
              min: 2,
              max: dbConfig.poolSize,
              createTimeoutMillis: 3000,
              acquireTimeoutMillis: 30000,
              idleTimeoutMillis: 30000,
              reapIntervalMillis: 1000,
              createRetryIntervalMillis: 100,
            },
            connection: {
              database: dbConfig.logDbName,
              user: dbConfig.user,
              password: dbConfig.pwd,
              host: dbConfig.host,
              port: dbConfig.port,
              ssl,
            },
            ...knexSnakeCaseMappers(),
          },
        };
      },
    }),
    // Register your objection models so it can be provided when needed.
    // ObjectionModule.forFeature([User]),
  ],
  exports: [ObjectionModule],
  controllers: [DatabaseController],
})
export class DatabaseModule {}

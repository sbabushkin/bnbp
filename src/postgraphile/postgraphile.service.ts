import { makeSchemaAndPlugin } from 'postgraphile-apollo-server';
import { Pool, PoolConfig } from 'pg';
import * as ConnectionFilterPlugin from 'postgraphile-plugin-connection-filter';
import { verify } from 'jsonwebtoken';
import * as simplify from '@graphile-contrib/pg-simplify-inflector';
import { custom as customOmit } from '@graphile-contrib/pg-omit-archived';
import PostgisPlugin from '@graphile/postgis';
import PgAggregatesPlugin from '@graphile/pg-aggregates';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { namePlugin, PgSmallNumericToFloatPlugin } from './pg-plugins';
import { AuthConfig, DatabaseConfig } from '../config/base.config';
import { User } from '../user/entities/user.entity';

@Injectable()
export class PostgraphileService {
  constructor(
    private readonly config: ConfigService,
  ) {}

  async schema() {
    const authConfig = this.config.get<AuthConfig>('auth');
    const dbConfig = this.config.get<DatabaseConfig>('database');

    const ssl = dbConfig.disableSsl ? false : { rejectUnauthorized: false };

    const dbConf: PoolConfig = {
      ssl,
      database: dbConfig.dbName,
      user: dbConfig.user,
      password: dbConfig.pwd,
      host: dbConfig.host,
      port: dbConfig.port,
      min: 2,
      max: dbConfig.poolSize,
      idleTimeoutMillis: 30000,
    };

    const pgPool = new Pool(dbConf);

    const appendPlugins = [
      PostgisPlugin,
      customOmit('deleted'),
      simplify,
      namePlugin,
      ConnectionFilterPlugin,
      PgSmallNumericToFloatPlugin,
      PgAggregatesPlugin,
    ];

    return makeSchemaAndPlugin(
      pgPool,
      'public', // PostgreSQL schema to use
      {
        appendPlugins,
        // PostGraphile options, see:
        // https://www.graphile.org/postgraphile/usage-library/
        disableDefaultMutations: true,
        watchPg: true,
        dynamicJson: true, // By default, JSON and JSONB fields are presented as strings (JSON encoded),
        graphileBuildOptions: {
          pgDeletedColumnName: 'deleted_at',
          pgDeletedRelations: true,
          connectionFilterRelations: true,
          /*
           * Uncomment if you want simple collections to lose the 'List' suffix
           * (and connections to gain a 'Connection' suffix).
           */
          pgOmitListSuffix: true,
          /*
           * Uncomment if you want 'userPatch' instead of 'patch' in update
           * mutations.
           */
          // pgSimplifyPatch: false,
          /*
           * Uncomment if you want 'allUsers' instead of 'users' at root level.
           */
          // pgSimplifyAllRows: false,
          /*
           * Uncomment if you want primary key queries and mutations to have
           * `ById` (or similar) suffix; and the `nodeId` queries/mutations
           * to lose their `ByNodeId` suffix.
           */
          // pgShortPk: true,
        },
        simpleCollections: 'both',
        pgOmitListSuffix: true,
        pgSettings: async (req: any) => {
          let payload: any;
          const res: any = {};

          if (req.headers.has('authorization')) {
            const tokenStr = req.headers.get('authorization');
            const [, jwtToken] = tokenStr.split(' ');

            try {
              payload = verify(jwtToken, authConfig.jwt.secret);
            } catch (e) {
              // throw new UnauthorizedException();
            }
          }

          if (payload) {
            const user = await User
              .query()
              .withGraphFetched('roles.permissions')
              .findById(payload.id);

            const permissions = Array.from(user.permissions.values()).join(',');
            res['jwt.claims.user_id'] = user.id;
            res['jwt.claims.role'] = user.roles[0].code;
            res['jwt.claims.permissions'] = permissions;
          } else {
            // res.role = authConfig.pgDefaultRole;
          }

          return res;
        },
      },
    );
  }
}

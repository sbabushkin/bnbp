import * as dotenv from 'dotenv';
import { normalize } from 'path';
import { config } from './config/base.config';

const envPath = normalize(`${__dirname}/../.env`);

dotenv.config({ path: envPath });
const db = config().database;

const ssl = db.disableSsl ? false : { rejectUnauthorized: false };

const coreConfig = {
  client: db.client,
  useNullAsDefault: true,
  debug: true,
  pool: { min: 2, max: db.poolSize },
  connection: {
    ssl,
    database: db.dbName,
    user: db.user,
    password: db.pwd,
    host: db.host,
    port: db.port,
  },
};

const logConfig = {
  client: db.client,
  useNullAsDefault: true,
  debug: true,
  pool: { min: 2, max: db.poolSize },
  connection: {
    ssl,
    database: db.logDbName,
    user: db.user,
    password: db.pwd,
    host: db.host,
    port: db.port,
  },
  migrations: {
    directory: './migrations-logs',
  },
};

module.exports = (forceLogConfig = false) => (process.env.DB_SCOPE === 'logs' || forceLogConfig ? logConfig : coreConfig);

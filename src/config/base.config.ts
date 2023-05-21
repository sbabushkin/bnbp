// this is base-project-contract config, if it will become too big we can separate it to different part
// (ex. database.config.ts, thirdParty.config.ts, etc)
// if you need custom config values (ex. database pwd) use .env in the root
import { MainConfig } from './base.config.type';

export * from './base.config.type';

export const config = (): MainConfig => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  importChunkSize: parseInt(process.env.IMPORT_CHUNK_SIZE, 10) || 500,
  mainDomain: process.env.MAIN_DOMAIN || `localhost:${process.env.PORT || 3000}`,
  redis: {
    redisClusterHosts: process.env.REDIS_CLUSTER_HOSTS || null,
    redisHost: process.env.REDIS_HOST || 'localhost',
    redisPort: process.env.REDIS_PORT || '6379',
    imageCacheTtl: parseInt(process.env.REDIS_IMAGE_CACHE_TTL, 10) || 60 * 60 * 24,
  },
  pdfConverter: {
    url: process.env.PDF_CONVERTER_URL || 'http://localhost:3005',
  },
  database: {
    client: 'pg',
    host: process.env.PG_HOST || 'localhost',
    port: parseInt(process.env.PG_PORT, 10) || 6432,
    user: process.env.PG_USER || 'bnbp',
    pwd: process.env.PG_PWD || '1',
    dbName: process.env.DB_NAME || 'bnbp',
    logDbName: `${process.env.DB_NAME || 'bnbp'}_logs`,
    disableSsl: process.env.DISABLE_SSL ? (process.env.DISABLE_SSL === 'true') : true,
    poolSize: parseInt(process.env.PG_POOL_SIZE, 10) || 10,
  },
  auth: {
    jwt: {
      secret: process.env.JWT_SECRET || 'secret12356789',
      expiresIn: parseInt(process.env.JWT_EXPIRES_IN, 10) || 8_460_000,
      refreshTokenExpiresIn: parseInt(process.env.REFRESH_TOKEN_EXPIRATION, 10) || 259_200_000,
    },
    pgDefaultRole: process.env.PG_DEFAULT_ROLE || 'visitor',
    recoveryAttempts: 5,
  },
  pubSub: {
    topic: process.env.KAFKA_PUBSUB_TOPIC || 'event',
    host: process.env.KAFKA_HOST || 'localhost',
    port: process.env.KAFKA_PORT || '9092',
    inMemory: process.env.IN_MEMORY_PUBSUB === 'true' || false,
    payloadMaxSize: parseInt(process.env.KAFKA_PUBSUB_PAYLOAD_MAX_SIZE, 10) || 1024 * 1024,
  },
  bucketConfig: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    endpoint: process.env.AWS_ENDPOINT || '',
    bucket: process.env.AWS_BUCKET || '',
  },
  emailConfig: {
    host: process.env.EMAIL_HOST || '',
    port: parseInt(process.env.EMAIL_PORT, 10) || 465,
    username: process.env.EMAIL_USERNAME || '4219348',
    password: process.env.EMAIL_PASSWORD || '',
    defaultSenderEmail: process.env.EMAIL_DEFAULT_SENDER_EMAIL || '',
    defaultSenderName: process.env.EMAIL_DEFAULT_SENDER_NAME || '',
  },
  testConfig: {
    isTest: (typeof jest !== 'undefined') || process.env.NODE_ENV === 'test',
  },
  isLocal: process.env.IS_LOCAL === 'true' || false,
  env: process.env.ENV,
  smsC: {
    login: process.env.SMSC_LOGIN || '',
    password: process.env.SMSC_PWD || '',
    url: process.env.SMSC_URL || '',
    sender: process.env.SMSC_SENDER || '',
    isSimulateSending: (process.env.SMSC_IS_SIMULATE_SENDING || 'true') === 'true',
  },
});

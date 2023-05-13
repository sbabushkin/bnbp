export interface DatabaseConfig {
  client: 'pg',
  host: string,
  port: number,
  user: string,
  pwd: string,
  dbName: string,
  logDbName: string,
  disableSsl: boolean,
  poolSize: number,
}

export interface JwtConfig {
  secret: string;
  expiresIn: number;
  refreshTokenExpiresIn: number,
}

export interface PubSubConfig {
  topic: string,
  host: string,
  port: string,
  inMemory: boolean,
  payloadMaxSize: number;
}
//
export interface OneCConfig {
  allowPayment: boolean,
  requestTimeout: number,
  b2b: OneCEndpointConfig,
  b2c: OneCEndpointConfig,
}

export interface OneCEndpointConfig {
  host: string,
  username: string,
  password: string,
}

export interface JobSettingsConfig {
  nextMilestoneAfter: number,
}

export interface BucketConfig {
  endpoint: string,
  accessKeyId: string,
  secretAccessKey: string,
  bucket: string,
}

export interface EmailConfig {
  host: string,
  port: number,
  username: string,
  password: string,
  defaultSenderEmail: string,
  defaultSenderName: string,
}

export interface TestConfig {
  isTest: boolean,
}

export interface AuthConfig {
  jwt: JwtConfig;
  pgDefaultRole: string;
  recoveryAttempts: number;
}

export interface RedisConfig {
  redisClusterHosts: string;
  redisHost: string;
  redisPort: string;
  imageCacheTtl: number;
}

export interface PdfConverter {
  url: string;
}

export interface SmsCConfig {
  login: string;
  password: string;
  url: string;
  sender: string;
  isSimulateSending: boolean;
}

export interface MainConfig {
  port: number;
  importChunkSize: number;
  mainDomain: string;
  database: DatabaseConfig;
  auth: AuthConfig,
  pubSub: PubSubConfig,
  bucketConfig: BucketConfig,
  emailConfig: EmailConfig,
  testConfig: TestConfig,
  isLocal: boolean;
  env: string;
  redis: RedisConfig;
  pdfConverter: PdfConverter;
  smsC: SmsCConfig;
}

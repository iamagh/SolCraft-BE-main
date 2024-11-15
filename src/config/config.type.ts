export type AppConfig = {
  nodeEnv: string;
  name: string;
  workingDirectory: string;
  frontendDomain?: string;
  backendDomain: string;
  port: number;
  apiPrefix: string;
};

export type ThrottleConfig = {
  limit: number;
  ttl: number;
};

export type LinodeConfig = {
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  endpoint: string;
  bucket: string;
};

export type AuthConfig = {
  secret?: string;
  expires?: string;
  refreshSecret?: string;
  refreshExpires?: string;
  loginRedirectUrl?: string;
};

export type PaymentConfig = {
  clientId?: string;
  username?: string;
  password?: string;
  apiUrl?: string;
  redirectUrl?: string;
  providerOrderIdRange?: [number, number];
};

export type DatabaseConfig = {
  url?: string;
  type?: string;
  host?: string;
  port?: number;
  password?: string;
  name?: string;
  username?: string;
  synchronize?: boolean;
  maxConnections: number;
  sslEnabled?: boolean;
  rejectUnauthorized?: boolean;
  ca?: string;
  key?: string;
  cert?: string;
};

export type FacebookConfig = {
  clientId?: string;
  clientSecret?: string;
};

export type FileConfig = {
  driver: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  awsDefaultS3Bucket?: string;
  awsDefaultS3Url?: string;
  awsS3Region?: string;
  maxFileSize: number;
};

export type MicrosoftConfig = {
  clientId?: string;
  clientSecret?: string;
};

export type MailConfig = {
  from: string;
  apiKey: string;
};

export type SolanaConfig = {
  mainnetUrl: string;
};

export type MinecraftConfig = {
  serverAddress: string;
  serverPort: number;
  mapId: string;
};

export type AllConfigType = {
  app: AppConfig;
  auth: AuthConfig;
  database: DatabaseConfig;
  facebook: FacebookConfig;
  microsoft: MicrosoftConfig;
  payment: PaymentConfig;
  mail: MailConfig;
  linode: LinodeConfig;
  throttle: ThrottleConfig;
};

import { registerAs } from '@nestjs/config';
import { AuthConfig } from './config.type';
import { IsString } from 'class-validator';
import validateConfig from 'src/utils/validate-config';

class EnvironmentVariablesValidator {
  @IsString()
  AUTH_JWT_ACCESS_SECRET: string;

  @IsString()
  AUTH_JWT_REFRESH_SECRET: string;

  @IsString()
  AUTH_ACCESS_TOKEN_EXPIRES_IN: string;

  @IsString()
  AUTH_REFRESH_TOKEN_EXPIRES_IN: string;

  @IsString()
  AUTH_LOGIN_REDIRECT_URI: string;

  @IsString()
  AUTH_REGISTER_REDIRECT_URI: string;
}

export default registerAs<AuthConfig>('auth', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    accessSecret: process.env.AUTH_JWT_ACCESS_SECRET,
    refreshSecret: process.env.AUTH_JWT_REFRESH_SECRET,
    accessExpires: process.env.AUTH_ACCESS_TOKEN_EXPIRES_IN,
    refreshExpires: process.env.AUTH_REFRESH_TOKEN_EXPIRES_IN,
    loginRedirectUrl: `${process.env.FRONTEND_DOMAIN}/${process.env.AUTH_LOGIN_REDIRECT_URI}`,
    registerRedirectUrl: `${process.env.FRONTEND_DOMAIN}/${process.env.AUTH_REGISTER_REDIRECT_URI}`,
  };
});

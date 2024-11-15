import { registerAs } from '@nestjs/config';
import { MicrosoftConfig } from './config.type';
import { IsString } from 'class-validator';
import validateConfig from 'src/utils/validate-config';

class EnvironmentVariablesValidator {
  @IsString()
  MICROSOFT_CLIENT_ID: string;

  @IsString()
  MICROSOFT_CALLBACK_URL: string;

  @IsString()
  MICROSOFT_AUTHORIZATION_URL: string;

  @IsString()
  MICROSOFT_TOKEN_URL: string;

  @IsString()
  MICROSOFT_GRAPH_URL: string;
}

export default registerAs<MicrosoftConfig>('microsoft', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    authorizationURL: process.env.MICROSOFT_AUTHORIZATION_URL,
    tokenURL: process.env.MICROSOFT_TOKEN_URL,
    clientId: process.env.MICROSOFT_CLIENT_ID,
    callbackUri: `${process.env.BACKEND_DOMAIN}${process.env.MICROSOFT_CALLBACK_URL}`,
    callbackUri2: `${process.env.BACKEND_DOMAIN}${process.env.MICROSOFT_CALLBACK_URLL}`,
    graphUrl: process.env.MICROSOFT_GRAPH_URL,
  };
});

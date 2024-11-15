import { registerAs } from '@nestjs/config';
import { SolanaConfig } from './config.type';
import { IsString } from 'class-validator';
import validateConfig from 'src/utils/validate-config';

class EnvironmentVariablesValidator {
  @IsString()
  SOLANA_MAINNET_URL: string;
}

export default registerAs<SolanaConfig>('solana', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    mainnetUrl: process.env.SOLANA_MAINNET_URL,
    tokenProgramId: process.env.TOKEN_PROGRAM_ID,
    tokenListUrl: process.env.TOKEN_LIST_URL,
  };
});

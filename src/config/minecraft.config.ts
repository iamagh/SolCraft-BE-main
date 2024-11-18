import { registerAs } from '@nestjs/config';
import { MinecraftConfig } from './config.type';
import { IsString } from 'class-validator';
import validateConfig from 'src/utils/validate-config';

class EnvironmentVariablesValidator {
  @IsString()
  SOLANA_MAINNET_URL: string;
}

export default registerAs<MinecraftConfig>('minecraft', () => {
  console.log("here")
  validateConfig(process.env, EnvironmentVariablesValidator);
  
  return {
    serverAddress: process.env.SERVER_ADDRESS,
    serverPort: Number(process.env.SERVER_PORT),
    mapId: process.env.MAP_ID,
  };
});

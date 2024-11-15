import { SetMetadata } from '@nestjs/common';

export const PLAYER_VALIDATION_KEY = 'playerValidationRequired';
export const PlayerValidationRequired = () =>
  SetMetadata(PLAYER_VALIDATION_KEY, true);

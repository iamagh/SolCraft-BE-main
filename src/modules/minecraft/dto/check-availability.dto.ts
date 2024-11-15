import { IsString } from 'class-validator';

export class CheckAvailabilityDto {
  @IsString()
  blockPosHash: string;
  @IsString()
  corner1: string;
  @IsString()
  corner2: string;
  @IsString()
  playerId: string;
}

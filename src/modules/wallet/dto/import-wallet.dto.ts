import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ImportWalletDto {
  @ApiProperty()
  @MinLength(1)
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  privateKey: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class MessageSendDto {
  @ApiProperty()
  @MinLength(1)
  @IsString()
  content: string;

  @ApiProperty()
  @IsString()
  friendId?: string;

  @ApiProperty()
  @IsString()
  messengerId?: string;
}

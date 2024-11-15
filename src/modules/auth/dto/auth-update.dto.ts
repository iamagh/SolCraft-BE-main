import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength, Validate } from 'class-validator';
import { IsNotExist } from '../../../utils/validators/is-not-exists.validator';

export class AuthUpdateDto {
  @ApiProperty({ example: 'johnnie' })
  @IsOptional()
  @MinLength(3)
  @IsString()
  @Validate(IsNotExist, ['User'], {
    message: 'username_already_exist',
  })
  username?: string;

  @ApiProperty({ example: 'John' })
  @IsOptional()
  @MinLength(3)
  @IsString()
  firstName?: string;

  @ApiProperty({ example: 'Doe' })
  @IsOptional()
  @MinLength(3)
  @IsString()
  lastName?: string;
}

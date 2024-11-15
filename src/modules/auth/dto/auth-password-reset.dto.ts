import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Validate } from 'class-validator';
import { Transform } from 'class-transformer';
import { IsExist } from '../../../utils/validators/is-exists.validator';

export class ForgotPasswordDto {
  @ApiProperty({ example: 'test1@example.com' })
  @IsNotEmpty()
  @Transform(({ value }) => value.toLowerCase().trim())
  @Validate(IsExist, ['User'], {
    message: 'user_not_exist',
  })
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({ example: 'test1@example.com' })
  @IsNotEmpty()
  @Transform(({ value }) => value.toLowerCase().trim())
  @Validate(IsExist, ['User'], {
    message: 'user_not_exist',
  })
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  verifyToken: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  verifyCode: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  passwordConfirm: string;
}

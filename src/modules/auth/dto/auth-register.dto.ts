import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class AuthRegisterDto {
  @ApiProperty({ example: 'test1@example.com' })
  @Transform(({ value }) => value.toLowerCase().trim())
  // @Validate(IsNotExist, ['User'], {
  //   message: 'email_already_exists',
  // })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: '+37499887766' })
  // @Validate(IsNotExist, ['User'], {
  //   message: 'phone_already_exists',
  // })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 'johnnie' })
  @Transform(({ value }) => value.toLowerCase().trim())
  // @Validate(IsNotExist, ['User'], {
  //   message: 'username_already_exists',
  // })
  @MinLength(3)
  @IsOptional()
  @IsString()
  username?: string;

  @ApiProperty()
  @MinLength(6)
  @IsString()
  password: string;

  @ApiProperty({ example: 'John' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({ example: 'Doe' })
  @IsOptional()
  @IsString()
  lastName?: string;
}

export class AuthVerifyRegisterDto {
  @ApiProperty({ example: '' })
  @MinLength(6)
  @IsNotEmpty()
  @IsString()
  verifyCode: string;

  @ApiProperty({ example: '' })
  @IsNotEmpty()
  @IsString()
  verifyToken: string;
}

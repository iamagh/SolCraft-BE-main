import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from 'src/modules/role/role.entity';
import {
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
  Validate,
} from 'class-validator';
import { IsNotExist } from 'src/utils/validators/is-not-exists.validator';
import { IsExist } from 'src/utils/validators/is-exists.validator';

export class UpdateUserDto {
  @ApiProperty({ example: 'admin@example.com' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  @IsOptional()
  @Validate(IsNotExist, ['User'], {
    message: 'email_already_exists',
  })
  @IsEmail()
  email?: string;

  @ApiProperty({ example: 'adminious' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  @Validate(IsNotExist, ['User'], {
    message: 'username_already_exists',
  })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiProperty()
  @IsOptional()
  @MinLength(6)
  password?: string;

  @ApiProperty({ example: 'Super' })
  @IsOptional()
  firstName?: string;

  @ApiProperty({ example: 'Admin' })
  @IsOptional()
  lastName?: string;

  @ApiProperty({ type: Role })
  @IsOptional()
  @Validate(IsExist, ['Role', 'id'], {
    message: 'role_not_exists',
  })
  role?: Role;
}

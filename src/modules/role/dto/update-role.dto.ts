import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, Validate } from 'class-validator';
import { Transform } from 'class-transformer';
import { IsNotExist } from '../../../utils/validators/is-not-exists.validator';

export class UpdateRoleDto {
  @ApiProperty({ example: 'Admin' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  @IsOptional()
  @IsString()
  @Validate(IsNotExist, ['Role'], {
    message: 'role_already_exist',
  })
  name: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Validate } from 'class-validator';
import { IsNotExist } from '../../../utils/validators/is-not-exists.validator';
import { Transform } from 'class-transformer';

export class CreateRoleDto {
  @ApiProperty({ example: 'Admin' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  @IsNotEmpty()
  @IsString()
  @Validate(IsNotExist, ['Role'], {
    message: 'role_already_exist',
  })
  name: string;
}

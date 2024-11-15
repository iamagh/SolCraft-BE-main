import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Put,
  SerializeOptions,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RoleGuard } from './role.guard';
import { Roles } from './role.decorator';
import { RoleEnum } from './role.enum';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';
import { ParamUUID } from '../../decorators/ParamUUID';

@ApiBearerAuth()
@ApiTags('Role')
@UseGuards(JwtAccessGuard, RoleGuard)
@Controller({
  path: 'role',
})
@Roles(RoleEnum.SUPER_ADMIN)
export class RoleController {
  constructor(private readonly roleService: RoleService) {}
  @SerializeOptions({
    groups: ['admin'],
  })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.roleService.create(createRoleDto);
  }

  @SerializeOptions({
    groups: ['admin'],
  })
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll() {
    return await this.roleService.listRoles();
  }

  @SerializeOptions({
    groups: ['admin'],
  })
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  getRole(@ParamUUID('id') id: string) {
    return this.roleService.getRole({ id });
  }

  @SerializeOptions({
    groups: ['admin'],
  })
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  update(@ParamUUID('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.roleService.update({ id }, updateRoleDto);
  }

  @SerializeOptions({
    groups: ['admin'],
  })
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@ParamUUID('id') id: string) {
    return this.roleService.delete(id);
  }
}

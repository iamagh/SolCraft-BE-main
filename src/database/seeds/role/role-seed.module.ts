import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from 'src/modules/role/role.entity';
import { RoleSeedService } from './role-seed.service';
import { RoleService } from 'src/modules/role/role.service';

@Module({
  imports: [TypeOrmModule.forFeature([Role])],
  providers: [RoleSeedService, RoleService],
  exports: [RoleSeedService],
})
export class RoleSeedModule {}

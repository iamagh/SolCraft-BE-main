import { Injectable, Logger } from '@nestjs/common';
import { RoleEnum } from 'src/modules/role/role.enum';
import { RoleService } from 'src/modules/role/role.service';

@Injectable()
export class RoleSeedService {
  private readonly logger: Logger = new Logger(RoleSeedService.name);
  constructor(private readonly roleService: RoleService) {}

  async run() {
    const countAdminRole = await this.roleService.count({
      name: RoleEnum.ADMIN,
    });

    if (countAdminRole === 0) {
      await this.roleService.create({
        name: RoleEnum.ADMIN,
      });

      this.logger.verbose('Role admin seeded successfully');
    }

    const countSuperAdminRole = await this.roleService.count({
      name: RoleEnum.SUPER_ADMIN,
    });

    if (countSuperAdminRole === 0) {
      await this.roleService.create({
        name: RoleEnum.SUPER_ADMIN,
      });

      this.logger.verbose('Role super admin seeded successfully');
    }

    const countClientRole = await this.roleService.count({
      name: RoleEnum.CLIENT,
    });

    if (countClientRole === 0) {
      await this.roleService.create({
        name: RoleEnum.CLIENT,
      });

      this.logger.verbose('Role client seeded successfully');
    }
  }
}

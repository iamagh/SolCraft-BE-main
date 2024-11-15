import { Injectable, Logger } from '@nestjs/common';
import { RoleEnum } from 'src/modules/role/role.enum';
import { UserService } from 'src/modules/user/services/user.service';
import { RoleService } from 'src/modules/role/role.service';

@Injectable()
export class UserSeedService {
  private readonly logger: Logger = new Logger(UserSeedService.name);
  constructor(
    private userService: UserService,
    private roleService: RoleService,
  ) {}

  async run() {
    const countSuperAdmin = await this.userService.count({
      role: {
        name: RoleEnum.SUPER_ADMIN,
      },
    });

    if (countSuperAdmin === 0) {
      const role = await this.roleService.getRole({
        name: RoleEnum.SUPER_ADMIN,
      });

      await this.userService.create({
        username: 'super.admin@example.com',
        firstName: 'Super',
        lastName: 'Admin',
        email: 'super.admin@example.com',
        password: 'secret',
        role,
      });
      this.logger.verbose('Super admin seeded successfully');
    }
  }
}

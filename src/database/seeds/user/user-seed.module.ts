import { Module } from '@nestjs/common';
import { UserSeedService } from './user-seed.service';
import { UserModule } from '../../../modules/user/user.module';

@Module({
  imports: [UserModule],
  providers: [UserSeedService],
  exports: [UserSeedService],
})
export class UserSeedModule {}

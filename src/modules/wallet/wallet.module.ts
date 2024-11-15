import { Module } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletEntity } from './wallet.entity';
import { BaseService } from '../base/base.service';
import { TopCoinsService } from '../top-coins/top-coins.service';
import { HttpModule, HttpService } from '@nestjs/axios';
import { UserService } from '../user/services/user.service';
import { User } from '../user/entities/user.entity';
import { UserFavoriteCoin } from '../user/entities/user-favorite-coin.entity';
import { RoleService } from '../role/role.service';
import { Role } from '../role/role.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([WalletEntity, User, UserFavoriteCoin, Role]),
    HttpModule,
  ],
  providers: [
    WalletService,
    BaseService,
    TopCoinsService,
    UserService,
    RoleService,
  ],
  controllers: [WalletController],
  exports: [WalletService],
})
export class WalletModule {}

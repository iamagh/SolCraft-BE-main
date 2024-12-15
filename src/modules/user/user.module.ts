import { Module } from '@nestjs/common';
import { UserService } from './services/user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserFriends } from './entities/user-friends.entity';
import { IsExist } from 'src/utils/validators/is-exists.validator';
import { IsNotExist } from 'src/utils/validators/is-not-exists.validator';
import { RoleService } from '../role/role.service';
import { Role } from '../role/role.entity';
import { BaseService } from '../base/base.service';
import { UserFriendsService } from './services/user-friends.service';
import { UserFavoriteCoin } from './entities/user-favorite-coin.entity';
// import {MessageService} from '../socket/socket.message'


@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role, UserFriends, UserFavoriteCoin]),
  ],
  controllers: [UserController],
  providers: [
    IsExist,
    IsNotExist,
    UserService,
    RoleService,
    BaseService,
    UserFriendsService
  ],
  exports: [UserService, RoleService, UserFriendsService],
})
export class UserModule {}

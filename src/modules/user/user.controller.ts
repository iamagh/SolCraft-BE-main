import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Put,
  Query,
  Request,
  SerializeOptions,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { UserService } from './services/user.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';
import { ParamUUID } from '../../decorators/ParamUUID';
import { Throttle } from '@nestjs/throttler';
import { AddFriendDto } from './dto/add-friend.dto';
import { UserFriendsService } from './services/user-friends.service';
import { User } from './entities/user.entity';

// import { MessageService } from '../socket/socket.message';

@ApiBearerAuth()
@ApiTags('User')
@UseGuards(JwtAccessGuard)
@Controller({
  path: 'user',
})
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly userFriendService: UserFriendsService,
    // private readonly messageService : MessageService
  ) { }

  @SerializeOptions({
    groups: ['admin'],
  })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  addAdmin(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @SerializeOptions({
    groups: ['admin'],
  })
  @Get('client')
  @HttpCode(HttpStatus.OK)
  async findAllClients(@Query(new ValidationPipe()) query: any) {
    return this.userService.listClients(query);
  }

  @SerializeOptions({
    groups: ['admin'],
  })
  @Get('admin')
  @HttpCode(HttpStatus.OK)
  async findAllAdmins(@Query(new ValidationPipe()) query: any) {
    return this.userService.listAdmins(query);
  }

  @SerializeOptions({
    groups: ['admin'],
  })
  @Get('admin/:id')
  @HttpCode(HttpStatus.OK)
  findOne(@ParamUUID('id') id: string) {
    return this.userService.getUserBy({ id });
  }

  @SerializeOptions({
    groups: ['admin'],
  })
  @Put('admin/:id')
  @HttpCode(HttpStatus.OK)
  update(@ParamUUID('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @SerializeOptions({
    groups: ['admin'],
  })
  @Delete('admin/:id')
  @HttpCode(HttpStatus.OK)
  remove(@ParamUUID('id') id: string) {
    return this.userService.delete(id);
  }

  @Post('friends')
  @HttpCode(HttpStatus.CREATED)
  addFriend(
    @Body() addFriendDto: AddFriendDto,
    @Request() { user }: { user: User },
  ) {
    // this.userFriendService.sendFriendRequest(
    //   user,
    //   addFriendDto.friendEmail,
    // )
    //   .then(() => {
    //     this.messageService.sendMessageToUser(user.id,  'Friend request sent')
    //   })
    //   .catch(err => console.log(err))

    return true
  }

  @Get('friends')
  listFriends(@Request() { user }: { user: User }) {
    return this.userFriendService.listFriends(user.id);
  }

  @Get('friends/pending')
  listFriendRequests(@Request() { user }: { user: User }) {
    return this.userFriendService.listFriendRequests(user.id);
  }

  @Get('chat/active')
  getUserChats(@Request() { user }: { user: User }) {
    return this.userFriendService.listFriendRequests(user.id);
  }
}

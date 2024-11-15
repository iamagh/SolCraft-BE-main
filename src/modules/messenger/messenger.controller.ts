import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { MessengerService } from './messenger.service';
import { User } from '../user/entities/user.entity';
import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';
import { RoleGuard } from '../role/role.guard';
import { RoleEnum } from '../role/role.enum';
import { Roles } from '../role/role.decorator';
import { MessageSendDto } from './dto/message-send.dto';

@ApiBearerAuth()
@UseGuards(JwtAccessGuard)
@Controller('messenger')
@ApiTags('Messenger')
@UseGuards(JwtAccessGuard, RoleGuard)
export class MessengerController {
  constructor(private readonly messengerService: MessengerService) {}

  @Post('send')
  @Roles(RoleEnum.CLIENT)
  sendMessage(
    @Request() { user }: { user: User },
    @Body() messageSendDto: MessageSendDto,
  ) {
    const { content, friendId, messengerId } = messageSendDto;

    return this.messengerService.sendMessage(
      user,
      content,
      messengerId,
      friendId,
    );
  }

  @Get()
  @Roles(RoleEnum.CLIENT)
  getMessengers(@Request() { user }: { user: User }) {
    return this.messengerService.getAllByUserId(user.id);
  }

  @Get('/unread')
  @Roles(RoleEnum.CLIENT)
  getUnreadMessengers(@Request() { user }: { user: User }) {
    return this.messengerService.getUnreadMessengers(user.id);
  }

  @Get('/messages/:messengerId')
  @Roles(RoleEnum.CLIENT)
  getMessages(@Param('messengerId') messengerId: string) {
    return this.messengerService.getMessagesByMessengerId(messengerId);
  }
}

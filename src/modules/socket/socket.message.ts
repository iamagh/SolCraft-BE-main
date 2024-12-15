import { Injectable } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';

@Injectable()
export class MessageService {
  constructor(private readonly socketGateway: SocketGateway) {}

  sendNotification(message: string) {
    this.socketGateway.sendMessageToAll('notification', message);
  }

  sendMessageToUser(userId: string, message: string) {
    this.socketGateway.sendMessageToUser(userId, 'message', message);
  }

}

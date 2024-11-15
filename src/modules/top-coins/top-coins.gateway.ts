import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { BinanceWebSocketService } from './binance-websocket.service';

@WebSocketGateway()
export class TopCoinsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  private clientSockets: Set<Socket> = new Set();

  constructor(
    private readonly binanceWebSocketService: BinanceWebSocketService,
  ) {
    // Subscribe to Binance WebSocket messages
    this.binanceWebSocketService.onMessage((topCoins) => {
      this.broadcastTopCoins(topCoins);
    });
  }

  handleConnection(client: Socket) {
    console.log('Client connected:', client.id);
    this.clientSockets.add(client);
  }

  handleDisconnect(client: Socket) {
    console.log('Client disconnected:', client.id);
    this.clientSockets.delete(client);
  }

  @SubscribeMessage('getTopCoins')
  handleGetTopCoins(client: Socket) {
    // This can be used to handle specific client requests if needed.
  }

  private broadcastTopCoins(topCoins: any) {
    this.clientSockets.forEach((client) => {
      client.emit('topCoins', topCoins);
    });
  }
}

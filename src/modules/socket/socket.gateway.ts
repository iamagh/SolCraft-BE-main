import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    MessageBody,
  } from '@nestjs/websockets';
  import { Server, Socket } from 'socket.io';
  
//   @WebSocketGateway({
//     cors: {
//     //   origin: 'http://localhost:3000', // Replace with your React app URL
//       origin: '*', // Replace with your React app URL
//       methods: ['GET', 'POST'],
//       path: '/ws'
//     },
//   })


//   @WebSocketGateway(4800, { cors: { origin: '*' } })
@WebSocketGateway( { path: '/ws', cors: true })
  export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;
  
    handleConnection(client: Socket) {
      console.log(`Client connected: ${client.id}`);
    }
  
    handleDisconnect(client: Socket) {
      console.log(`Client disconnected: ${client.id}`);
    }
  
    @SubscribeMessage('message')
    handleMessage(@MessageBody() message: string): void {
      console.log('Message received:', message);
      // Broadcast the message to all connected clients
      this.server.emit('message', message);
    }
  }
  
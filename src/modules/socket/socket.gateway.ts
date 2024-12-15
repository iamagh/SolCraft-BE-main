import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ path: '/ws', cors: true })
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private userSockets = new Map<string, string>();

    handleConnection(client: Socket) {
        console.log(`Client connected: ${client.id}`);

        const userId = Array.isArray(client.handshake.query.userId)
            ? client.handshake.query.userId[0] // Take the first element if it's an array
            : client.handshake.query.userId;
        if (userId) {
            this.userSockets.set(userId, client.id);
            console.log(`Client connected: ${client.id} (User ID: ${userId})`);
        } else {
            console.log(`Client connected: ${client.id} (No User ID)`);
        }
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

    sendMessageToAll(event: string, message: any): void {
        this.server.emit(event, message);
    }

    // Method to send a message to a specific user
    sendMessageToUser(userId: string, event: string, message: any): void {
        const socketId = this.userSockets.get(userId);
        if (socketId) {
            this.server.to(socketId).emit(event, message);
            console.log(`Message sent to User ID ${userId}:`, message);
        } else {
            console.log(`User ID ${userId} is not connected`);
        }
    }

}

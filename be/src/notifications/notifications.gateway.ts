import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: (
      process.env.CORS_ORIGIN ??
      'http://localhost:3000,http://localhost:3001,http://localhost:8081'
    ).split(','),
    credentials: true,
  },
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  handleConnection(client: Socket) {
    let userId = client.handshake.query.userId;
    if (Array.isArray(userId)) {
      userId = userId[0];
    }
    if (userId && typeof userId === 'string') {
      void client.join(`user_${userId}`);
      console.log(`Socket client ${client.id} joined room: user_${userId}`);
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`Socket client disconnected: ${client.id}`);
  }

  @SubscribeMessage('subscribe')
  handleSubscribe(client: Socket, payload: { userId: string }) {
    if (payload?.userId) {
      void client.join(`user_${payload.userId}`);
      console.log(
        `Socket client ${client.id} manually subscribed to: user_${payload.userId}`,
      );
      return { status: 'success', room: `user_${payload.userId}` };
    }
    return { status: 'error', message: 'Invalid userId' };
  }

  /** Emit event to a specific user */
  sendToUser(userId: string, event: string, data: any) {
    if (this.server) {
      this.server.to(`user_${userId}`).emit(event, data);
    }
  }

  /** Emit event to everyone */
  broadcast(event: string, data: any) {
    if (this.server) {
      this.server.emit(event, data);
    }
  }
}

import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { Message } from '../models/message.model';
import { Conversation } from '../models/conversation.model';
import { User } from '../models/user.model';

class SocketService {
    private static _io: Server;

    public static init(server: HttpServer) {
        this._io = new Server(server, {
            cors: {
                origin: '*',
                methods: ['GET', 'POST']
            }
        });

        this._io.on('connection', (socket: Socket) => {
            console.log('Client connected:', socket.id);

            socket.on('join', async (userId: string) => {
                socket.join(userId);
                console.log(`User ${userId} joined their room`);

                // If this user is an admin, also join the shared 'admin' room
                try {
                    const user = await User.findById(userId);
                    if (user && user.role === 'admin') {
                        socket.join('admin');
                        console.log(`Admin ${userId} also joined 'admin' room`);
                    }
                } catch (err) {
                    // Fallback: couldn't check role, that's ok
                    console.log(`Could not check role for ${userId}`);
                }
            });

            socket.on('sendMessage', async (data: {
                senderId: string;
                receiverId: string;
                content: string;
                senderType: 'user' | 'admin'
            }) => {
                try {
                    const { senderId, receiverId, content, senderType } = data;

                    // Identify the user in this conversation
                    const userId = senderType === 'user' ? senderId : receiverId;

                    // Find or create conversation
                    let conversation = await Conversation.findOne({ user: userId });
                    if (!conversation) {
                        conversation = await Conversation.create({ user: userId });
                    }

                    // Save message
                    const message = await Message.create({
                        conversationId: conversation._id,
                        sender: senderId,
                        senderType: senderType,
                        content: content
                    });

                    // Update conversation
                    conversation.lastMessage = content;
                    if (senderType === 'user') {
                        conversation.unreadCount += 1;
                    }
                    await conversation.save();

                    // Route message to receiver
                    if (senderType === 'user') {
                        // User sent a message → broadcast to ALL admins via the 'admin' room
                        this._io.to('admin').emit('receiveMessage', message);
                        console.log(`Message from user ${senderId} broadcast to admin room`);
                    } else {
                        // Admin sent a message → send to the specific user
                        this._io.to(receiverId).emit('receiveMessage', message);
                        console.log(`Message from admin ${senderId} sent to user ${receiverId}`);
                    }

                    // Confirm to sender
                    this._io.to(senderId).emit('messageSent', message);

                } catch (error) {
                    console.error('Error handling sendMessage:', error);
                }
            });

            socket.on('disconnect', () => {
                console.log('Client disconnected:', socket.id);
            });
        });

        return this._io;
    }

    public static sendToUser(userId: string, event: string, data: any) {
        if (this._io) {
            this._io.to(userId).emit(event, data);
        } else {
            console.warn('Socket.io not initialized. Cannot send event.');
        }
    }

    public static sendToAll(event: string, data: any) {
        if (this._io) {
            this._io.emit(event, data);
        }
    }
}

export default SocketService;

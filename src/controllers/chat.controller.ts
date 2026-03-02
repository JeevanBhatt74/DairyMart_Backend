import { Request, Response } from "express";
import { Message } from "../models/message.model";
import { Conversation } from "../models/conversation.model";

export class ChatController {
    // Get message history for a conversation (for users)
    async getMessages(req: Request, res: Response) {
        try {
            const { userId } = req.params;

            const conversation = await Conversation.findOne({ user: userId });
            if (!conversation) {
                return res.status(200).json({
                    success: true,
                    data: []
                });
            }

            const messages = await Message.find({ conversationId: conversation._id })
                .sort({ timestamp: 1 });

            res.status(200).json({
                success: true,
                data: messages
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Get all conversations (for admin)
    async getConversations(req: Request, res: Response) {
        try {
            const conversations = await Conversation.find()
                .populate('user', 'fullName email profilePicture')
                .sort({ updatedAt: -1 });

            res.status(200).json({
                success: true,
                data: conversations
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Mark messages as read (for admin or user)
    async markAsRead(req: Request, res: Response) {
        try {
            const { userId } = req.params;
            await Conversation.findOneAndUpdate(
                { user: userId },
                { unreadCount: 0 }
            );

            res.status(200).json({
                success: true,
                message: "Messages marked as read"
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
}

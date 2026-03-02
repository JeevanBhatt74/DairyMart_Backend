import mongoose, { Schema, Document } from "mongoose";

export interface IConversation extends Document {
    user: mongoose.Types.ObjectId;
    lastMessage?: string;
    unreadCount: number;
    updatedAt: Date;
    createdAt: Date;
}

const conversationSchema = new Schema<IConversation>(
    {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
        lastMessage: { type: String },
        unreadCount: { type: Number, default: 0 },
    },
    { timestamps: true }
);

export const Conversation = mongoose.model<IConversation>("Conversation", conversationSchema);

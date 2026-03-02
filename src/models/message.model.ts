import mongoose, { Schema, Document } from "mongoose";

export interface IMessage extends Document {
    conversationId: mongoose.Types.ObjectId;
    sender: mongoose.Types.ObjectId;
    senderType: 'user' | 'admin';
    content: string;
    timestamp: Date;
}

const messageSchema = new Schema<IMessage>(
    {
        conversationId: { type: Schema.Types.ObjectId, ref: "Conversation", required: true },
        sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
        senderType: { type: String, enum: ['user', 'admin'], required: true },
        content: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

// Index for fast retrieval of message history
messageSchema.index({ conversationId: 1, timestamp: 1 });

export const Message = mongoose.model<IMessage>("Message", messageSchema);

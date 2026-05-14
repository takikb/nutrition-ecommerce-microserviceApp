import mongoose from "mongoose";

interface messageAttrs {
    conversationId: string;
    senderId: string;
    recipientId: string;
    content: string;
}

interface messageDoc extends mongoose.Document {
    conversationId: string;
    senderId: string;
    recipientId: string;
    content: string;
    
    isRead: boolean;

    updatedAt: Date;
    createdAt: Date;
 
    version: number;
}

interface messageModel extends mongoose.Model<messageDoc> {
    build(attrs: messageAttrs): messageDoc;
}

const messageSchema = new mongoose.Schema({
    conversationId: { type: String, required: true, index: true },
    senderId: { type: String, required: true },
    recipientId: { type: String, required: true, index: true },
    content: { type: String, required: true },
    isRead: { type: Boolean, default: false }
}, {
    timestamps: true,
    optimisticConcurrency: true,
    toJSON: {
        transform(doc, ret: any) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
        }
    }
});
messageSchema.set('versionKey', 'version');

messageSchema.pre('save', function() {
    if (!this.isNew) {
        this.increment();
    }
});

messageSchema.statics.build = (attrs: messageAttrs) => {
    return new Message(attrs);
}

const Message = mongoose.model<messageDoc, messageModel>('Message', messageSchema);

export { Message };
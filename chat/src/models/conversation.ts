import mongoose from 'mongoose';

interface conversationAttrs {
    productId: string;
    customerId: string;
    vendorId: string;
    orderId?: string;
    productTitle: string;
    productPrice: number;
}

interface conversationDoc extends mongoose.Document {
    orderId?: string;
    productId: string;
    customerId: string;
    vendorId: string;

    isActive: boolean;

    productTitle: string;
    productPrice: number;

    lastMessage?: string; // For quick preview in conversation list
    lastMessageAt?: Date; 

    updatedAt: Date;
    createdAt: Date;

    version: number;
}

interface conversationModel extends mongoose.Model<conversationDoc> {
    build(attrs: conversationAttrs): conversationDoc;
}

const conversationSchema = new mongoose.Schema({
    productId: { type: String, required: true },
    customerId: { type: String, required: true, index: true },
    vendorId: { type: String, required: true, index: true },
    
    //orderId is optional, it will be null untill the user order.
    orderId: { type: String, index: true },

    isActive: { type: Boolean, default: true },

    productTitle: { type: String },
    productPrice: { type: Number },
    
    // For quick preview in conversation list
    lastMessage: { type: String },
    lastMessageAt: { type: Date }
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
conversationSchema.set('versionKey', 'version');

conversationSchema.pre('save', function() {
    if (!this.isNew) {
        this.increment();
    }
});

conversationSchema.statics.build = (attrs: conversationAttrs) => {
    return new Conversation(attrs);
}

const Conversation = mongoose.model<conversationDoc, conversationModel>('Conversation', conversationSchema);

export { Conversation };
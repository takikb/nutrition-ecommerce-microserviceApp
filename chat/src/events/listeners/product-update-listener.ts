import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { Listener, Subjects, ProductUpdatedEvent } from "@d-ziet/common-lib";
import { Product } from "../../models/product";
import { Conversation } from "../../models/conversation";
import { queueGroupName } from "./queue-group-name";
import { io } from "../../app";

export class ProductUpdateListener extends Listener<ProductUpdatedEvent> {
    subject: Subjects.ProductUpdated = Subjects.ProductUpdated;
    queueGroupName = queueGroupName;

    async onMessage(data: ProductUpdatedEvent['data'], msg: Message) {
        const { id, title, priceDZD, vendorId, images, verificationStatus, version } = data;

        try {
            const existingProduct: any = await Product.findById(id);

            if (existingProduct) {
                
                // If the event is newer, sync and force-align version 
                if (version > existingProduct.version) {
                    
                    const objectId = new mongoose.Types.ObjectId(id); // Cast to raw ObjectId 
                    
                    // FIXED: Executing raw MongoDB driver write to completely bypass Mongoose OCC [4]
                    await Product.collection.updateOne(
                        { _id: objectId },
                        { $set: { title, priceDZD, images, version } }
                    );
                }
                return msg.ack();
            }

            // Handle unapproved/rejected state changes dynamically
            if (verificationStatus !== 'approved') {
                await Conversation.updateMany({ productId: id }, { isActive: false });
                
                const conversations = await Conversation.find({ productId: id });
                conversations.forEach((conv) => {
                    io.to(conv.customerId).to(conv.vendorId).emit('conversationArchived', {
                        conversationId: conv.id,
                        reason: 'Product Unapproved'
                    });
                });

                return msg.ack();
            }

            // Create the approved product replica
            const product = Product.build({ id, title, priceDZD, vendorId, images });
            product.set({ version });
            await product.save();

            msg.ack();
        } catch (err: any) {
            console.error("Chat Product Sync Error:", err.message);
        }
    }
}
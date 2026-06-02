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
        const { id, title, priceDZD, vendorId, images, verificationStatus } = data;

        try {
            // Explicitly cast to 'any' to bypass strict version checks [4]
            let product: any = await Product.findByEvent(data);

            if (!product) {
                const existingProduct = await Product.findById(id);
                if (existingProduct) {
                    throw new Error(`Out of order product update. DB version: ${existingProduct.version}, Event version: ${data.version}`);
                }

                if (verificationStatus === 'approved') {
                    product = Product.build({ id, title, priceDZD, vendorId, images });
                    await product.save();
                    return msg.ack();
                }

                return msg.ack();
            }

            if (verificationStatus !== 'approved') {
                await Conversation.updateMany({ productId: id }, { isActive: false });
                
                const conversations = await Conversation.find({ productId: id });
                conversations.forEach((conv) => {
                    io.to(conv.customerId).to(conv.vendorId).emit('conversationArchived', {
                        conversationId: conv.id,
                        reason: 'Product Unapproved'
                    });
                });

                await product.deleteOne();
                return msg.ack();
            }

            product.set({ title, priceDZD, images });
            await product.save();

            msg.ack();
        } catch (err) {
            console.error("Error replicating ProductUpdatedEvent in Chat service:", err);
        }
    }
}
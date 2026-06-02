import { Message } from "node-nats-streaming";
import { Listener, Subjects, ProductDeletedEvent } from "@d-ziet/common-lib";
import { Conversation } from "../../models/conversation";
import { Product } from "../../models/product";
import { queueGroupName } from "./queue-group-name";
import { io } from "../../app";

export class ProductDeletedListener extends Listener<ProductDeletedEvent> {
    subject: Subjects.ProductDeleted = Subjects.ProductDeleted;
    queueGroupName = queueGroupName;

    async onMessage(data: ProductDeletedEvent['data'], msg: Message) {
        const { id } = data;

        try {
            const conversations = await Conversation.find({ productId: id });

            if (conversations.length > 0) {
                // Archive all conversations associated with the deleted product
                await Conversation.updateMany(
                    { productId: id },
                    { 
                        $set: { 
                            isActive: false,
                            lastMessage: 'This product has been deleted by the vendor.' 
                        } 
                    }
                );

                conversations.forEach((conv) => {
                    io.to(conv.customerId).to(conv.vendorId).emit('conversationArchived', {
                        conversationId: conv.id,
                        reason: 'Product Deleted'
                    });
                });
            }

            // Clean up the local replica product record [4]
            const product = await Product.findById(id);
            if (product) {
                await product.deleteOne();
            }

            msg.ack();
        } catch (err) {
            console.error("Error processing ProductDeletedEvent in Chat service:", err);
        }
    }
}
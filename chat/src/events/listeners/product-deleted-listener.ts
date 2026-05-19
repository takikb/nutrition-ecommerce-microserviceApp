import { Listener, ProductDeletedEvent, Subjects } from "@d-ziet/common-lib";
import { Message } from "node-nats-streaming";
import { queueGroupName } from "./queue-group-name";
import { Conversation } from "../../models/conversation";
import { io } from "../../app";

export class ProductDeletedListener extends Listener<ProductDeletedEvent> {
    subject: Subjects.ProductDeleted = Subjects.ProductDeleted;
    queueGroupName = queueGroupName;

    async onMessage(data: ProductDeletedEvent['data'], msg: Message) {
        const { id } = data;

        const conversations = await Conversation.find({ productId: id });

        if (conversations.length === 0) {
            return msg.ack();
        }
  
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

        console.log(`Archived ${conversations.length} conversations due to product deletion.`);

        msg.ack();
    }
}
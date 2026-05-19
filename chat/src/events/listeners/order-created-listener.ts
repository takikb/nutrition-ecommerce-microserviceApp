import { Listener, OrderCreatedEvent, Subjects } from "@d-ziet/common-lib";
import { queueGroupName } from "./queue-group-name";
import { Message } from "node-nats-streaming";
import { Conversation } from "../../models/conversation";
import { io } from "../../app";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    subject: Subjects.OrderCreated = Subjects.OrderCreated;
    queueGroupName = queueGroupName;

    async onMessage(data: OrderCreatedEvent['data'], msg: Message) {        
        
        let conversation = await Conversation.findOne({ 
            productId: data.product.id,
            customerId: data.userId,
         });

        if (!conversation) {
             const newConversation = Conversation.build({
                productId: data.product.id,
                customerId: data.userId,
                vendorId: data.product.vendorId,
                productTitle: data.product.title,
                productPrice: data.product.priceDZD,
                orderId: data.id
            })
            await newConversation.save();

            // Notify vendor via socket that a new order request is in the chat
            io.to(data.product.vendorId).emit('orderCreatedInChat', {
                conversationId: newConversation._id.toString(),
                orderId: data.id
            });

        } else {
            conversation.set({ 
                orderId: data.id,
                isActive: true
            });
            await conversation.save();

            // Notify vendor via socket that a new order request is in the chat
            io.to(data.product.vendorId).emit('orderCreatedInChat', {
                conversationId: conversation._id.toString(),
                orderId: data.id
            });
        }
        msg.ack();
    }
}
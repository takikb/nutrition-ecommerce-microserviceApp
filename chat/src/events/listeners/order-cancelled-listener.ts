import { Listener, OrderCancelledEvent, Subjects } from "@d-ziet/common-lib";
import { Message } from "node-nats-streaming";
import { queueGroupName } from "./queue-group-name";
import { Conversation } from "../../models/conversation";
import { io } from "../../app";

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
    subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
    queueGroupName = queueGroupName;

    async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
        const conversation = await Conversation.findOne({ orderId: data.id });

        if (!conversation) {
            return msg.ack();
        }

        // Archive the conversation
        conversation.set({ isActive: false });
        await conversation.save();

        // Real-time: Tell both users the chat is now locked/archived
        io.to(conversation.customerId).to(conversation.vendorId).emit('conversationArchived', {
            conversationId: conversation.id,
            reason: 'Order Cancelled'
        });

        msg.ack();
    }
}
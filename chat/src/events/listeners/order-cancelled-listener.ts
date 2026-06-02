import { Message } from "node-nats-streaming";
import { Listener, Subjects, OrderCancelledEvent } from "@d-ziet/common-lib";
import { Conversation } from "../../models/conversation";
import { queueGroupName } from "./queue-group-name";
import { io } from "../../app";

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
    subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
    queueGroupName = queueGroupName;

    async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
        try {
            const conversation = await Conversation.findOne({ orderId: data.id });

            if (!conversation) {
                return msg.ack();
            }

            // Archive the conversation
            conversation.set({ isActive: false });
            await conversation.save();

            // Notify users via Socket.io to lock message textareas
            io.to(conversation.customerId).to(conversation.vendorId).emit('conversationArchived', {
                conversationId: conversation.id,
                reason: 'Order Cancelled'
            });

            msg.ack();
        } catch (err) {
            console.error("Error processing OrderCancelledEvent in Chat service:", err);
        }
    }
}
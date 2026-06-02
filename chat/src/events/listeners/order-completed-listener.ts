import { Message } from "node-nats-streaming";
import { Listener, Subjects, OrderCompletedEvent } from "@d-ziet/common-lib";
import { Conversation } from "../../models/conversation";
import { queueGroupName } from "./queue-group-name";
import { io } from "../../app";

export class OrderCompletedListener extends Listener<OrderCompletedEvent> {
    subject: Subjects.OrderCompleted = Subjects.OrderCompleted;
    queueGroupName = queueGroupName;

    async onMessage(data: OrderCompletedEvent['data'], msg: Message) {
        try {
            const conversation = await Conversation.findOne({ orderId: data.id });

            if (!conversation) {
                return msg.ack();
            }

            conversation.set({ isActive: false });
            await conversation.save();

            // Notify users via Socket.io to lock message textareas
            io.to(conversation.customerId).to(conversation.vendorId).emit('conversationArchived', {
                conversationId: conversation.id,
                reason: 'Order Completed'
            });

            msg.ack();
        } catch (err) {
            console.error("Error processing OrderCompletedEvent in Chat service:", err);
        }
    }
}
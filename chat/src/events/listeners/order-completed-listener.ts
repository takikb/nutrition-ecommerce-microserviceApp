import { Listener, OrderCompletedEvent, Subjects } from "@d-ziet/common-lib";
import { Message } from "node-nats-streaming";
import { queueGroupName } from "./queue-group-name";
import { Conversation } from "../../models/conversation";
import { io } from "../../app";

export class OrderCompletedListener extends Listener<OrderCompletedEvent> {
    subject: Subjects.OrderCompleted = Subjects.OrderCompleted;
    queueGroupName = queueGroupName;

    async onMessage(data: OrderCompletedEvent['data'], msg: Message) {
        const conversation = await Conversation.findOne({ orderId: data.id });

        if (!conversation) {
            return msg.ack();
        }

        conversation.set({ isActive: false });
        await conversation.save();

        // Notify users via Socket.io to disable the "Send" button in the UI
        io.to(conversation.customerId).to(conversation.vendorId).emit('conversationArchived', {
            conversationId: conversation.id,
            reason: 'Order Completed'
        });

        msg.ack();
    }
}
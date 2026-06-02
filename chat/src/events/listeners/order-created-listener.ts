import { Message } from "node-nats-streaming";
import { Listener, Subjects, OrderCreatedEvent } from "@d-ziet/common-lib";
import { Conversation } from "../../models/conversation";
import { Product } from "../../models/product"; 
import { User } from "../../models/user";       
import { queueGroupName } from "./queue-group-name";
import { io } from "../../app";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    subject: Subjects.OrderCreated = Subjects.OrderCreated;
    queueGroupName = queueGroupName;

    async onMessage(data: OrderCreatedEvent['data'], msg: Message) {        
        const { id: orderId, userId, product: eventProduct } = data;

        try {
            // Explicitly cast to 'any' to bypass strict Mongoose compiler mismatches [4]
            let product: any = await Product.findById(eventProduct.id);
            if (!product) {
                product = Product.build({
                    id: eventProduct.id,
                    title: eventProduct.title,
                    priceDZD: eventProduct.priceDZD,
                    vendorId: eventProduct.vendorId
                });
                await product.save();
            }

            let customer: any = await User.findById(userId);
            if (!customer) {
                customer = User.build({
                    id: userId,
                    fullName: "Active Member", 
                    role: "customer"
                });
                await customer.save();
            }

            let conversation = await Conversation.findOne({ 
                productId: eventProduct.id,
                customerId: userId,
            });

            if (!conversation) {
                const newConversation = Conversation.build({
                    productId: eventProduct.id,
                    customerId: userId,
                    vendorId: eventProduct.vendorId,
                    orderId: orderId
                });
                await newConversation.save();

                io.to(eventProduct.vendorId).emit('orderCreatedInChat', {
                    conversationId: newConversation._id,
                    orderId: orderId
                });
            } else {
                conversation.set({ 
                    orderId: orderId,
                    isActive: true
                });
                await conversation.save();

                io.to(eventProduct.vendorId).emit('orderCreatedInChat', {
                    conversationId: conversation.id,
                    orderId: orderId
                });
            }

            msg.ack();
        } catch (err) {
            console.error("Error processing OrderCreatedEvent in Chat service:", err);
        }
    }
}
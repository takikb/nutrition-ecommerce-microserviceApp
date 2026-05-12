import { Listener, OrderCancelledEvent, Subjects } from "@d-ziet/common-lib";
import { queueGroupName } from "./queue-group-name";
import { Message } from "node-nats-streaming";
import { Product } from "../../models/product";

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
    subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
    queueGroupName = queueGroupName;

    async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
        const product = await Product.findById(data.product.id);

        if (!product) {
            throw new Error('Product not found');
        }
        product.set({ inquiryCount: product.inquiryCount - 1 });
        await product.save();

        msg.ack();
    }
}
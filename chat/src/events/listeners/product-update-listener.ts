import { Listener, ProductUpdatedEvent, Subjects } from "@d-ziet/common-lib";
import { Message } from "node-nats-streaming";
import { queueGroupName } from "./queue-group-name";
import { Conversation } from "../../models/conversation";
import { io } from "../../app";

export class ProductUpdateListener extends Listener<ProductUpdatedEvent> {
    subject: Subjects.ProductUpdated = Subjects.ProductUpdated;
    queueGroupName = queueGroupName;

    async onMessage(data: ProductUpdatedEvent['data'], msg: Message) {

        const conversations = await Conversation.find({ productId: data.id });

        if (conversations.length === 0) {
            return msg.ack();
        }

        if (data.verificationStatus !== 'approved') {
            msg.ack();
        }

        await Conversation.updateMany({ productId: data.id }, {
            productTitle: data.title,
            productPrice: data.priceDZD,
        });

        msg.ack();
    }
}
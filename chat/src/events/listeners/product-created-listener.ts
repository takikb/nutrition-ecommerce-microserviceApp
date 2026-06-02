import { Message } from "node-nats-streaming";
import { Listener, Subjects, ProductCreatedEvent } from "@d-ziet/common-lib";
import { Product } from "../../models/product";
import { queueGroupName } from "./queue-group-name";

export class ProductCreatedListener extends Listener<ProductCreatedEvent> {
    subject: Subjects.ProductCreated = Subjects.ProductCreated;
    queueGroupName = queueGroupName;

    async onMessage(data: ProductCreatedEvent['data'], msg: Message) {
        const { id, title, priceDZD, vendorId, images, verificationStatus } = data;

        try {
            const existingProduct = await Product.findById(id);
            if (existingProduct) {
                return msg.ack();
            }

            if (verificationStatus !== 'approved') {
                // Ignore unapproved products; they aren't "live" on the marketplace
                return msg.ack();
            }

            const product = Product.build({
                id,
                title,
                priceDZD,
                vendorId,
                images
            });
            await product.save();

            msg.ack();
        } catch (err) {
            console.error("Error replicating ProductCreatedEvent in Chat service:", err);
        }
    }
}
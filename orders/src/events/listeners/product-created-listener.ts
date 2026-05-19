import { Message } from 'node-nats-streaming';
import { Subjects, Listener, ProductCreatedEvent } from '@d-ziet/common-lib';
import { Product } from '../../models/product';
import { queueGroupName } from './queue-group-name';

export class ProductCreatedListener extends Listener<ProductCreatedEvent> {
    subject: Subjects.ProductCreated = Subjects.ProductCreated;
    queueGroupName = queueGroupName;

    async onMessage(data: ProductCreatedEvent['data'], msg: Message) {
        const { id, title, priceDZD, vendorId, verificationStatus } = data;
        
        if (verificationStatus !== 'approved') {
            // If the product isn't approved, we don't want to add it to our Orders DB since it's not "live" yet.
            // We still want to ack the message so it doesn't get redelivered, but we won't add it to our DB until it's approved and we get a ProductUpdatedEvent with verificationStatus: "approved"
            return msg.ack();
        }

        const product = Product.build({
            id,
            title,
            priceDZD,
            vendorId
        });
        await product.save();
        
        msg.ack();
    }
}

import { Message } from 'node-nats-streaming';
import { Subjects, Listener, ProductCreatedEvent } from '@d-ziet/common-lib';
import { Product } from '../../models/product';
import { queueGroupName } from './queue-group-name';

export class ProductCreatedListener extends Listener<ProductCreatedEvent> {
    subject: Subjects.ProductCreated = Subjects.ProductCreated;
    queueGroupName = queueGroupName;

    async onMessage(data: ProductCreatedEvent['data'], msg: Message) {
        const { id, title, priceDZD } = data;
        
        const product = Product.build({
            id,
            title,
            priceDZD
        });
        await product.save();
        
        msg.ack();
    }
}

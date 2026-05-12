import { Message } from 'node-nats-streaming';
import { Subjects, Listener, ProductUpdatedEvent, NotFoundError } from '@d-ziet/common-lib';
import { Product } from '../../models/product';
import { queueGroupName } from './queue-group-name';

export class ProductUpdatedListener extends Listener<ProductUpdatedEvent> {
    subject: Subjects.ProductUpdated = Subjects.ProductUpdated
    queueGroupName = queueGroupName;

    async onMessage(data: ProductUpdatedEvent['data'], msg: Message) {
        const { id, title, priceDZD, version } = data;
        const product = await Product.findByEvent(data);
        
        if (!product) {
            throw new Error('Product not found'); 
        }

        product.set({ title, priceDZD });
        await product.save();

        msg.ack();
    }
}

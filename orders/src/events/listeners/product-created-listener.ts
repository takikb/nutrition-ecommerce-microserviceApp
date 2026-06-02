import { Message } from 'node-nats-streaming';
import { Subjects, Listener, ProductCreatedEvent } from '@d-ziet/common-lib';
import { Product } from '../../models/product';
import { queueGroupName } from './queue-group-name';

export class ProductCreatedListener extends Listener<ProductCreatedEvent> {
    subject: Subjects.ProductCreated = Subjects.ProductCreated;
    queueGroupName = queueGroupName;

    async onMessage(data: ProductCreatedEvent['data'], msg: Message) {
        const { id, title, priceDZD, vendorId, verificationStatus, images } = data;
        
        try {
            // Defensively check if product already exists to prevent E11000 duplicate key errors
            const existingProduct = await Product.findById(id);
            if (existingProduct) {
                // If it already exists, safely update the fields and acknowledge
                existingProduct.set({ title, priceDZD, images });
                await existingProduct.save();
                return msg.ack();
            }

            if (verificationStatus !== 'approved') {
                // If the product isn't approved, we don't want to add it to our Orders DB since it's not "live" yet.
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
            console.error("Error processing ProductCreatedEvent in Orders service:", err);
            // We do NOT call msg.ack() here if there's a database connection drop so NATS can retry,
            // but the duplicate key errors are handled safely above.
        }
    }
}
import { Message } from 'node-nats-streaming';
import { Subjects, Listener, ProductUpdatedEvent } from '@d-ziet/common-lib';
import { Product } from '../../models/product';
import { queueGroupName } from './queue-group-name';

export class ProductUpdatedListener extends Listener<ProductUpdatedEvent> {
    subject: Subjects.ProductUpdated = Subjects.ProductUpdated;
    queueGroupName = queueGroupName;

    async onMessage(data: ProductUpdatedEvent['data'], msg: Message) {
        const { id, title, priceDZD, vendorId, verificationStatus, images } = data;
        
        try {
            let product = await Product.findByEvent(data);
            
            if (!product) {
                // If the product was not found (because it was pending on creation) 
                // but is now approved, defensively build and save it in the Orders DB [2]
                if (verificationStatus === 'approved') {
                    product = Product.build({
                        id,
                        title,
                        priceDZD,
                        vendorId,
                        images
                    });
                    await product.save();
                    return msg.ack();
                }

                // If it is still not approved and doesn't exist, acknowledge and skip [2]
                return msg.ack();
            }

            // Normal update flow if the product already exists [2]
            product.set({ title, priceDZD, images });
            await product.save();

            msg.ack();
        } catch (err) {
            // Defensive wrapper prevents unhandled rejections from killing the process [2]
            console.error("Error processing ProductUpdatedEvent:", err);
        }
    }
}
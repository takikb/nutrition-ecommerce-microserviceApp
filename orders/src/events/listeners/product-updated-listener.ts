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
            // Find by version concurrency check
            let product = await Product.findByEvent(data);
            
            if (!product) {
                // Inspect if the product exists in the DB under ANY other version [2]
                const existingProduct = await Product.findById(id);
                
                if (existingProduct) {
                    // SCENARIO A: Product exists but version is out-of-order (e.g., received v2 before v1) [2].
                    // We must NOT call msg.ack() so NATS redelivers once version sequence catches up.
                    throw new Error(`Out-of-order event. DB version is ${existingProduct.version}, event version is ${data.version}`);
                }

                // SCENARIO B: Product truly does not exist yet.
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

                // If it doesn't exist and isn't approved, acknowledge and skip [2]
                return msg.ack();
            }

            // Normal sequential update flow [2]
            product.set({ title, priceDZD, images });
            await product.save();

            msg.ack();
        } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            console.error("Error processing ProductUpdatedEvent:", message);
            // If it's a version mismatch or database drop, we let NATS retry by NOT calling msg.ack() [2].
        }
    }
}
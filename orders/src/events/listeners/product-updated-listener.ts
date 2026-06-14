import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { Subjects, Listener, ProductUpdatedEvent } from '@d-ziet/common-lib';
import { Product } from '../../models/product';
import { queueGroupName } from './queue-group-name';

export class ProductUpdatedListener extends Listener<ProductUpdatedEvent> {
    subject: Subjects.ProductUpdated = Subjects.ProductUpdated;
    queueGroupName = queueGroupName;

    async onMessage(data: ProductUpdatedEvent['data'], msg: Message) {
        const { id, title, priceDZD, images, verificationStatus, version } = data;
        
        try {
            const existingProduct = await Product.findById(id);

            if (existingProduct) {
                // Self-Healing check: Only apply modifications if the incoming event is newer 
                if (version > existingProduct.version) {
                    const objectId = new mongoose.Types.ObjectId(id); // Cast to raw ObjectId 
                    
                    // Executing raw MongoDB driver write to completely bypass Mongoose OCC 
                    await Product.collection.updateOne(
                        { _id: objectId },
                        { $set: { title, priceDZD, images, version } }
                    );
                }
                return msg.ack(); // Always acknowledge to prevent retries of older/duplicate messages
            }

            // Create on-the-fly if approved and doesn't exist locally 
            if (verificationStatus === 'approved') {
                const product = Product.build({
                    id,
                    title,
                    priceDZD,
                    vendorId: data.vendorId,
                    images
                });
                product.set({ version });
                await product.save();
            }

            msg.ack();
        } catch (err: any) {
            console.error("Orders Product Sync Error:", err.message);
        }
    }
}
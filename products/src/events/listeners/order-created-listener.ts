import { Listener, OrderCreatedEvent, Subjects } from "@d-ziet/common-lib";
import { queueGroupName } from "./queue-group-name";
import { Message } from "node-nats-streaming";
import { Product } from "../../models/product";
import { natsWrapper } from "../../nats-wrapper";
import { ProductUpdatedPublisher } from "../publishers/product-updated-publisher";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    subject: Subjects.OrderCreated = Subjects.OrderCreated;
    queueGroupName = queueGroupName;

    async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
        const product = await Product.findById(data.product.id);

        if (!product) {
            throw new Error('Product not found');
        }
        product.set({ inquiryCount: product.inquiryCount + 1 });
        await product.save();

        await new ProductUpdatedPublisher(natsWrapper.client).publish({
            id: product._id.toString(),
            title: product.title,                
            description: product.description,
            priceDZD: product.priceDZD,
            images: product.images,
            nutritionTableImage: product.nutritionTableImage,
            category: product.category,
            vendorId: product.vendorId,
            calories: product.calories,
            proteinGrams: product.proteinGrams,
            carbsGrams: product.carbsGrams,
            fatGrams: product.fatGrams,
            containsAllergens: product.containsAllergens,
            version: product.version
        });

        msg.ack();
    }
}
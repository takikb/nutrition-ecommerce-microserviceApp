import mongoose from "mongoose";
import { Product } from "../../../models/product";
import { natsWrapper } from "../../../nats-wrapper";
import { Message } from "node-nats-streaming";
import { OrderCancelledEvent, Subjects, ProductCategory, Allergy, OrderCreatedEvent } from "@d-ziet/common-lib";
import { OrderCancelledListener } from "../order-cancelled-listener";


const title = 'Test Product';
const description = 'This is a test product description.';
const priceDZD = 1000;
const images = ['http://example.com/image1.jpg'];
const nutritionTableImage = 'http://example.com/nutrition.jpg';
const category = ProductCategory.SNACK;
const calories = 250;
const proteinGrams = 10;
const carbsGrams = 30;
const fatGrams = 5;
const containsAllergens = [Allergy.PEANUTS];


const setup = async () => {

    //create an instance of the listener
    const listener = new OrderCancelledListener(natsWrapper.client);
    
    //create and save a product
    const product = Product.build({
        title,
        description,
        priceDZD,
        images,
        nutritionTableImage,
        category,
        calories, 
        proteinGrams,
        carbsGrams,
        fatGrams,
        containsAllergens,
        vendorId: new mongoose.Types.ObjectId().toHexString()
    });
    await product.save();

    //increment the inquiry count to simulate an order being created
    product.set({ inquiryCount: product.inquiryCount + 1 });
    await product.save();    

    //create and save a fake data event
    const data: OrderCancelledEvent['data'] = {
        version: 0,
        id: new mongoose.Types.ObjectId().toHexString(),
        userId: new mongoose.Types.ObjectId().toHexString(),
        status: 'cancelled',
        product: {
            id: product._id.toHexString(),
            title: product.title,
            priceDZD: product.priceDZD,
            vendorId: product.vendorId
        }
    };

    //create a fake message object
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    };

    return { listener, product, data, msg };
}


it('decrements the inquiry count of the product', async () => {
    const { listener, product, data, msg } = await setup();

    await listener.onMessage(data, msg);

    //write assertions to make sure the inquiry count is decremented
    const updatedProduct = await Product.findById(product._id);
    expect(updatedProduct).toBeDefined();
    expect(updatedProduct!.inquiryCount).toEqual(product.inquiryCount - 1);
})    

it('acks the message', async () => {
    const { listener, data, msg } = await setup();

    await listener.onMessage(data, msg); 
    expect(msg.ack).toHaveBeenCalled();
})
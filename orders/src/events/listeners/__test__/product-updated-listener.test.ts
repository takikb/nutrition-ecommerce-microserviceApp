import mongoose from "mongoose"
import { Product } from "../../../models/product"
import { natsWrapper } from "../../../nats-wrapper"
import { ProductCategory, ProductUpdatedEvent } from "@d-ziet/common-lib"
import { Message } from "node-nats-streaming"
import { ProductUpdatedListener } from "../product-updated-listener"

const setup = async () => {
    //create an instance of the listener
    const listener = new ProductUpdatedListener(natsWrapper.client);
    
    //create and save a product
    const product = Product.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'Test Product',
        priceDZD: 1000
    });
    await product.save();

    //create a fake data event
    const data: ProductUpdatedEvent['data'] = {
        version: product.version + 1,
        id: product._id.toHexString(),
        title: 'Updated Test Product',
        description: 'This is a test product',
        priceDZD: 999,
        images: ['test-image.jpg'],
        nutritionTableImage: 'test-nutrition-image.jpg',
        category: ProductCategory.SNACK,
        vendorId: new mongoose.Types.ObjectId().toHexString(),
        calories: 100,
        proteinGrams: 10,
        carbsGrams: 20,
        fatGrams: 5,
        containsAllergens: []
    }

    //create a fake message object
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    };

    return { listener, data, product, msg };
}

it('creates and saves a product', async () => {
    const { listener, data, product, msg } = await setup();

    await listener.onMessage(data, msg);

    //write assertions to make sure a product was created
    const updatedProduct = await Product.findById(product._id);
    expect(updatedProduct).toBeDefined();
    expect(updatedProduct!.title).toEqual(data.title);
    expect(updatedProduct!.priceDZD).toEqual(data.priceDZD);
})

it('acks the message', async () => {
    const { listener, data, msg } = await setup();

    await listener.onMessage(data, msg);

    //write assertions to make sure ack function is called
    expect(msg.ack).toHaveBeenCalled();
})

it('does not call ack the event version is out of order', async () => {
    const { listener, data, msg } = await setup();
    data.version = 15;

    //write assertions to make sure ack function is not called
    try {
        await listener.onMessage(data, msg);
    } catch (err) {

    }
    expect(msg.ack).not.toHaveBeenCalled();
})
import mongoose from "mongoose"
import { Product } from "../../../models/product"
import { ProductCreatedListener } from "../product-created-listener"
import { natsWrapper } from "../../../nats-wrapper"
import { ProductCategory, ProductCreatedEvent } from "@d-ziet/common-lib"
import { Message } from "node-nats-streaming"

const setup = async () => {
    //create an instance of the listener
    const listener = new ProductCreatedListener(natsWrapper.client);
    
    //create a fake data event
    const data: ProductCreatedEvent['data'] = {
        version: 0,
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'Test Product',
        description: 'This is a test product',
        priceDZD: 1000,
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

    return { listener, data, msg };
}

it('creates and saves a product', async () => {
    const { listener, data, msg } = await setup();

    //call the onMessage function with the data object + message object
    await listener.onMessage(data, msg);

    //write assertions to make sure a product was created
    const product = await Product.findById(data.id);
    expect(product).toBeDefined();
    expect(product!.title).toEqual(data.title);
    expect(product!.priceDZD).toEqual(data.priceDZD);
})

it('acks the message', async () => {
    const { listener, data, msg } = await setup();

    //call the onMessage function with the data object + message object
    await listener.onMessage(data, msg);

    //write assertions to make sure ack function is called
    expect(msg.ack).toHaveBeenCalled();

})
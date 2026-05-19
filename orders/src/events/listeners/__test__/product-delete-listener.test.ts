import mongoose from "mongoose"
import { Product } from "../../../models/product"
import {Order} from "../../../models/order"
import { natsWrapper } from "../../../nats-wrapper"
import { OrderStatus, ProductCategory, ProductDeletedEvent, ProductUpdatedEvent } from "@d-ziet/common-lib"
import { Message } from "node-nats-streaming"
import { ProductDeletedListener } from "../product-delete-listener"

const setup = async () => {
    //create an instance of the listener
    const listener = new ProductDeletedListener(natsWrapper.client);
    
    //create and save a product
    const product = Product.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'Test Product',
        priceDZD: 1000,
        vendorId: new mongoose.Types.ObjectId().toHexString()
    });
    await product.save();

    const order = Order.build({
        userId: new mongoose.Types.ObjectId().toHexString(),
        status: OrderStatus.Created,
        product
    });
    await order.save();

    //create a fake data event
    const data: ProductDeletedEvent['data'] = {
        version: product.version + 1,
        id: product._id.toString(),
    };

    //create a fake message object
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    };

    return { listener, data, product, msg, order };
}

it('cancels the order when the product is deleted', async () => {
    const { listener, data, product, msg } = await setup();

    await listener.onMessage(data, msg);

    //write assertions to make sure a order was cancelled
    const deletedOrder = await Order.findOne({
        'product': product._id,
    });
    
    expect(deletedOrder).toBeDefined();
    expect(deletedOrder!.status).toEqual(OrderStatus.Cancelled);
})

it('acks the message', async () => {
    const { listener, data, msg } = await setup();

    await listener.onMessage(data, msg);

    //write assertions to make sure ack function is called
    expect(msg.ack).toHaveBeenCalled();
})
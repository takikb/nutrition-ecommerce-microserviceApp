import mongoose from "mongoose";
import { Conversation } from "../../../models/conversation";
import { OrderCreatedListener } from "../order-created-listener";
import { natsWrapper } from "../../../nats-wrapper";
import { Message } from "node-nats-streaming";
import { OrderCreatedEvent, OrderStatus } from "@d-ziet/common-lib";
import { io } from "../../../app";

const setup = async () => {
    const listener = new OrderCreatedListener(natsWrapper.client);

    //create a fake data event
    const data: OrderCreatedEvent['data'] = {
        version: 0,
        id: new mongoose.Types.ObjectId().toHexString(),
        userId: new mongoose.Types.ObjectId().toHexString(),
        status: OrderStatus.Created,
        product: {
            id: new mongoose.Types.ObjectId().toHexString(),
            title: 'Test Product',
            priceDZD: 1000,
            vendorId: new mongoose.Types.ObjectId().toHexString()
        }
    };        

    //create a fake message object
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    };

    return { listener, data, msg };
}

it('acks the message', async () => {
    const { listener, data, msg } = await setup();

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
})

it('creates a conversation when an order is created', async () => {
    const { listener, data, msg } = await setup();
    await listener.onMessage(data, msg);

    const conversation = await Conversation.findOne({ orderId: data.id });

    expect(conversation).toBeDefined();
    expect(conversation!.productId).toEqual(data.product.id);
    expect(conversation!.customerId).toEqual(data.userId);
    expect(conversation!.vendorId).toEqual(data.product.vendorId);
    expect(conversation!.productTitle).toEqual(data.product.title);
    expect(conversation!.productPrice).toEqual(data.product.priceDZD);
})

it('emits a socket event to the vendor when an order is created', async () => {
    
    const { listener, data, msg } = await setup();
    await listener.onMessage(data, msg);
    const conversation = await Conversation.findOne({ orderId: data.id });

    
    expect(io.to).toHaveBeenCalledWith(data.product.vendorId);

    expect(io.emit).toHaveBeenCalledWith('orderCreatedInChat', {
        conversationId: conversation!.id,
        orderId: data.id
    });
})
import mongoose from "mongoose";
import { Conversation } from "../../../models/conversation";
import { natsWrapper } from "../../../nats-wrapper";
import { Message } from "node-nats-streaming";
import { OrderCompletedListener } from "../order-completed-listener";
import { OrderCompletedEvent, OrderStatus } from "@d-ziet/common-lib";
import { io } from "../../../app";

const setup = async () => {
    const listener = new OrderCompletedListener(natsWrapper.client);

    //create a fake data event
    const data: OrderCompletedEvent['data'] = {
        version: 0,
        id: new mongoose.Types.ObjectId().toHexString(),
        userId: new mongoose.Types.ObjectId().toHexString(),
        status: OrderStatus.Complete,
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

    const conversation = Conversation.build({
        productId: data.product.id,
        customerId: data.userId,
        vendorId: data.product.vendorId,
        productTitle: data.product.title,
        productPrice: data.product.priceDZD,
        orderId: data.id
    });
    await conversation.save();

    return { listener, data, msg };
}

it('acks the message', async () => {
    const { listener, data, msg } = await setup();

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
})

it('archives a conversation when an order is completed', async () => {
    const { listener, data, msg } = await setup();
    await listener.onMessage(data, msg);

    const conversation = await Conversation.findOne({ orderId: data.id });

    expect(conversation).toBeDefined();
    expect(conversation!.customerId).toEqual(data!.userId);
    expect(conversation!.isActive).toEqual(false);
})

it('emits a socket event to the vendor and customer when an order is completed', async () => {
    
    const { listener, data, msg } = await setup();
    await listener.onMessage(data, msg);
    const conversation = await Conversation.findOne({ orderId: data.id });

    
    expect(io.to).toHaveBeenNthCalledWith(1, data.userId);

    expect(io.to).toHaveBeenNthCalledWith(2, data.product.vendorId);

    expect(io.emit).toHaveBeenCalledWith('conversationArchived', {
        conversationId: conversation!.id,
        reason: 'Order Completed'
    });
})
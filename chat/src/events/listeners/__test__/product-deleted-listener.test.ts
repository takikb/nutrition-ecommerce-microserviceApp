import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { ProductDeletedEvent } from '@d-ziet/common-lib';
import { ProductDeletedListener } from '../product-deleted-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Conversation } from '../../../models/conversation';
import { io } from '../../../app';

const setup = async () => {
    const listener = new ProductDeletedListener(natsWrapper.client);

    const productId = new mongoose.Types.ObjectId().toHexString();

    // Create a conversation that should be archived
    const conversation = Conversation.build({
        productId,
        customerId: new mongoose.Types.ObjectId().toHexString(),
        vendorId: new mongoose.Types.ObjectId().toHexString(),
        productTitle: 'Test Product',
        productPrice: 100,
    });
    await conversation.save();

    const data: ProductDeletedEvent['data'] = {
        id: productId,
        version: 1 
    };

    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    };

    return { listener, data, msg, conversation };
};

it('archives the conversation when a product is deleted', async () => {
    const { listener, data, msg, conversation } = await setup();

    await listener.onMessage(data, msg);

    const updatedConversation = await Conversation.findById(conversation.id);

    expect(updatedConversation!.isActive).toBe(false);
    expect(updatedConversation!.lastMessage).toContain('deleted');
});

it('emits a socket event to participants', async () => {
    const { listener, data, msg, conversation } = await setup();

    await listener.onMessage(data, msg);

    expect(io.to).toHaveBeenCalledWith(conversation.customerId);
    expect(io.to).toHaveBeenCalledWith(conversation.vendorId);
    expect(io.emit).toHaveBeenCalledWith('conversationArchived', expect.any(Object));
});

it('acks the message', async () => {
    const { listener, data, msg } = await setup();
    await listener.onMessage(data, msg);
    expect(msg.ack).toHaveBeenCalled();
});
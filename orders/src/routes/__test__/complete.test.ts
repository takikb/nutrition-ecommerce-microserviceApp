import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Order } from '../../models/order';
import { Product } from '../../models/product';
import { natsWrapper } from '../../nats-wrapper';
import { OrderStatus } from '@d-ziet/common-lib/build/events/types/order-status';

it('returns an error if the Order does not exist', async () => {
    const orderId = new mongoose.Types.ObjectId();

    await request(app)
        .put(`/api/orders/${orderId}`)
        .set('Cookie', signinVendor(new mongoose.Types.ObjectId().toHexString()))
        .send({})
        .expect(404)
})

// orders/src/routes/__test__/complete.test.ts

it('returns a 401 if the vendor does not own the product', async () => {
    const vendorId = new mongoose.Types.ObjectId().toHexString();
    
    // Create product owned by vendor A
    const product = Product.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'Test Product',
        priceDZD: 1000,
        vendorId: vendorId
    });
    await product.save();

    // Create order for that product
    const order = Order.build({
        userId: 'customer-id',
        status: OrderStatus.Created,
        product: product
    });
    await order.save();

    // Try to complete it as Vendor B
    await request(app)
        .put(`/api/orders/${order._id}`)
        .set('Cookie', global.signinVendor(new mongoose.Types.ObjectId().toHexString())) // different ID generated inside signinVendor()
        .send({})
        .expect(401);
});

it('order is completed successfully by the correct vendor, and emits an event', async () => {
    const vendorId = new mongoose.Types.ObjectId().toHexString();
    const cookie = global.signinVendor(vendorId); 

    const product = Product.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'Test Product',
        priceDZD: 1000,
        vendorId: vendorId
    });
    await product.save();

    const order = Order.build({
        userId: 'customer-id',
        status: OrderStatus.Created,
        product: product
    });
    await order.save();

    await request(app)
        .put(`/api/orders/${order._id}`)
        .set('Cookie', cookie)
        .send({})
        .expect(200);

    const updatedOrder = await Order.findById(order._id);
    expect(updatedOrder!.status).toEqual(OrderStatus.Complete);
    expect(natsWrapper.client.publish).toHaveBeenCalled();

});
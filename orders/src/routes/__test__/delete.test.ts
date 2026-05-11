import request from 'supertest';
import { app } from '../../app';
import { OrderStatus } from '@d-ziet/common-lib';
import {Order} from '../../models/order';
import {Product} from '../../models/product';
import { natsWrapper } from '../../nats-wrapper';

it('cancels an order successfully', async () => {
    const user = global.signin();
    const product = Product.build({
        name: 'Test Product',
        priceDZD: 1000
    });
    await product.save();

    const { body: order } = await request(app)
        .post('/api/orders')
        .set('Cookie', user)
        .send({ productId: product._id })
        .expect(201);

    await request(app)
        .delete(`/api/orders/${order._id}`)
        .set('Cookie', user)
        .expect(204);

    //expectation to make sure the order is cancelled
    const updatedOrder = await Order.findById(order._id);
    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
})

it('emits an order cancelled event', async () => {
    const user = global.signin();
    const product = Product.build({
        name: 'Test Product',
        priceDZD: 1000
    });
    await product.save();

    const { body: order } = await request(app)
        .post('/api/orders')
        .set('Cookie', user)
        .send({ productId: product._id })
        .expect(201);

    await request(app)
        .delete(`/api/orders/${order._id}`)
        .set('Cookie', user)
        .expect(204);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
});
import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Product } from '../../models/product';
import { natsWrapper } from '../../nats-wrapper';

it('returns an error if the product does not exist', async () => {
    const productId = new mongoose.Types.ObjectId();

    await request(app)
        .post('/api/orders')
        .set('Cookie', signin())
        .send({ productId })
        .expect(404)
})

it('order a product successfully', async () => {
    const product = Product.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'Test Product',
        priceDZD: 1000,
        vendorId: new mongoose.Types.ObjectId().toHexString()
    })
    await product.save()

    await request(app)
        .post('/api/orders')
        .set('Cookie', signin())
        .send({ productId: product._id })
        .expect(201)
})

it('emits an order created event', async () => {
        const product = Product.build({
            id: new mongoose.Types.ObjectId().toHexString(),
            title: 'Test Product',
            priceDZD: 1000,
            vendorId: new mongoose.Types.ObjectId().toHexString()
        })
        await product.save()

    await request(app)
        .post('/api/orders')
        .set('Cookie', signin())
        .send({ productId: product._id })
        .expect(201)
    
    expect(natsWrapper.client.publish).toHaveBeenCalled();
})
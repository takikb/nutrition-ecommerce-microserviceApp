import request from 'supertest';
import { app } from '../../app';
import {Product} from '../../models/product';

it('fetches the order', async () => {
    //create a product
    const product = Product.build({
        name: 'Test Product',
        priceDZD: 1000
    })
    await product.save()
    
    const user = global.signin();
    //make a request to build an order with that product
    const { body: order } = await request(app)
        .post('/api/orders')
        .set('Cookie', user)
        .send({ productId: product._id })
        .expect(201)

    //make a request to fetch the order
    const { body: fetchedOrder } = await request(app)
        .get(`/api/orders/${order._id}`)
        .set('Cookie', user)
        .expect(200)

    expect(fetchedOrder.order._id).toEqual(order._id);
})

it('returns an error if a different user tries to fetch an order', async () => {
    //create a product
    const product = Product.build({
        name: 'Test Product',
        priceDZD: 1000
    })
    await product.save()
    
    const user = global.signin();
    //make a request to build an order with that product
    const { body: order } = await request(app)
        .post('/api/orders')
        .set('Cookie', user)
        .send({ productId: product._id })
        .expect(201)

    //make a request to fetch the order
    const { body: fetchedOrder } = await request(app)
        .get(`/api/orders/${order._id}`)
        .set('Cookie', global.signin()) // sign in as a different user
        .expect(401)
})
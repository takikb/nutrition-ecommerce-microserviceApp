import request from 'supertest';
import { app } from '../../app';
import { Order } from '../../models/order';
import { Product } from '../../models/product';

const buildProduct = async (name: string, priceDZD: number) => {
    const product = Product.build({
        name,
        priceDZD
    });
    await product.save();
    return product;
}


it('fetches orders for a particular user', async () => {
    // Create 3 products
    const product1 = await buildProduct('Product 1', 1000);
    const product2 = await buildProduct('Product 2', 2000);
    const product3 = await buildProduct('Product 3', 3000);

    const user1 = global.signin();
    const user2 = global.signin();

    // Create 1 order as User #1
    await request(app)
        .post('/api/orders')
        .set('Cookie', user1)
        .send({ productId: product1._id })
        .expect(201);

    // Create 2 orders as User #2
    const { body: order1 } = await request(app)
        .post('/api/orders')
        .set('Cookie', user2)
        .send({ productId: product2._id })
        .expect(201);

    const { body: order2 } = await request(app)
        .post('/api/orders')
        .set('Cookie', user2)
        .send({ productId: product3._id })
        .expect(201);

    // Make request to get orders for User #2
    const response = await request(app)
        .get('/api/orders')
        .set('Cookie', user2)
        .expect(200);

    // Verify the response
    expect(response.body.length).toEqual(2);
    expect(response.body[0].id).toEqual(order1.id);
    expect(response.body[1].id).toEqual(order2.id);
    expect(response.body[0].product.id).toEqual(product2._id.toString());
    expect(response.body[1].product.id).toEqual(product3._id.toString());
});
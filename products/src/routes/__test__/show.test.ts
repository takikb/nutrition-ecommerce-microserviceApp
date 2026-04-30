import request from 'supertest'
import { app } from '../../app'
import mongoose from 'mongoose'

it('returns a 404 if the product is not found', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();
    await request(app)
        .get(`/api/products/${id}`)
        .send()
        .expect(404)
    
})
 
it('returns the product if the product is found', async () => { 
    const title = 'Test Product';
    const description = 'This is a test product description.';
    const priceDZD = 1000;
    const images = ['http://example.com/image1.jpg'];
    const nutritionTableImage = 'http://example.com/nutrition.jpg';
    const category = 'snack';
    const calories = 250;
    const proteinGrams = 10;
    const carbsGrams = 30;
    const fatGrams = 5;
    const containsAllergens = ['peanuts'];

    const response = await request(app)
        .post('/api/products')
        .set('Cookie', global.signin())
        .send({
            title,
            description,
            priceDZD,
            images,
            nutritionTableImage,
            category,
            calories,
            proteinGrams,
            carbsGrams,
            fatGrams,
            containsAllergens
        })
        .expect(201)
    
    const productResponse = await request(app)
        .get(`/api/products/${response.body.id}`)
        .send()
        .expect(200)
       
    expect(productResponse.body.title).toEqual(title);
})
import request from 'supertest';
import { app } from '../../app'
import mongoose from 'mongoose'

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

const createProduct = (cookie: any) => {

    return request(app)
        .post('/api/products')
        .set('Cookie', cookie)
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
        });
}

it('returns a 404 if the product is not found', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();

    await request(app)
        .put(`/api/products/${id}`)
        .set('Cookie', global.signin())
        .send({
            title: 'Updated Title',
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
        .expect(404)
})

it('returns a 401 if the user is not authenticated', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();

    await request(app)
        .put(`/api/products/${id}`)
        .send({
            title: 'Updated Title',
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
        .expect(401)
})

it('returns a 401 if the user does not own the product', async () => {

    const response = await createProduct(global.signin());
    await request(app)
        .put(`/api/products/${response.body.id}`)
        .set('Cookie', global.signin()) 
        .send({
            title: 'Updated Title',
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
        .expect(401)
})


it('returns an error if an invalid input is provided', async () => {

    const cookie = global.signin();
    const response = await createProduct(cookie);

    await request(app)
        .put(`/api/products/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title,
            description,
            priceDZD: -10,
            images,
            nutritionTableImage,
            category,
            calories,
            proteinGrams,
            carbsGrams,
            fatGrams,
            containsAllergens
        })
        .expect(400)

    await request(app)
        .put(`/api/products/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: "",
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
        .expect(400)
})

it('updates the product with valid inputs', async () => {
    const cookie = global.signin();
    const response = await createProduct(cookie);

    await request(app)
        .put(`/api/products/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: 'Updated Title',
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
        .expect(200)

    const productResponse = await request(app)
        .get(`/api/products/${response.body.id}`)
        .send()
    
    expect(productResponse.body.title).toEqual('Updated Title');
})
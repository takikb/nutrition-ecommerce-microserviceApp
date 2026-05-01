import request from "supertest";
import { app } from "../../app";
import { Product } from "../../models/product";

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

it('has a route handler listening to /api/products for post requests', async () => {
    const response = await request(app)
        .post('/api/products')
        .send({});

    expect(response.status).not.toEqual(404);
})

it('can only be accessed by signed-in users', async () => {
    await request(app)
        .post('/api/products')
        .send({})
        .expect(401);
})

it ('returns a status other than 401 if the user is signed in', async () => {
    const response = await request(app)
        .post('/api/products')
        .set('Cookie', global.signin())
        .send({})
    
    expect(response.status).not.toEqual(401);
})

it('returns an error if an invalid input is provided', async () => {
    await request(app)
        .post('/api/products')
        .set('Cookie', global.signin())
        .send({
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

    await request(app)
        .post('/api/products')
        .set('Cookie', global.signin())
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
})


it('creates a product with valid input', async () => {
    let products = await Product.find({});
    expect(products.length).toEqual(0);

    await request(app)
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

    products = await Product.find({});
    expect(products.length).toEqual(1);
})
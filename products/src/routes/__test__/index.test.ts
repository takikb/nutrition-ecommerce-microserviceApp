import request from "supertest";
import { app } from "../../app";

const createProduct = () => {
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

    return request(app)
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
        });
}

it('can fetch a list of products', async () => {

    await createProduct();
    await createProduct();
    await createProduct();

    const response = await request(app)
        .get('/api/products')
        .send()
        .expect(200)

    expect(response.body.length).toEqual(3);
})
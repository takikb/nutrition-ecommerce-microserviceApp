import { Product } from "../product";
import { ProductCategory } from "../product";

it('implements optimistic concurrency control', async () => {
    const product = Product.build({
        title: 'Test Product',
        description: 'A product for testing OCC',
        priceDZD: 1000,
        images: ['http://example.com/image1.jpg'],
        nutritionTableImage: 'http://example.com/nutrition.jpg',
        category: ProductCategory.SNACK,
        vendorId: 'vendor123',
        calories: 500,
        proteinGrams: 30,
        carbsGrams: 50,
        fatGrams: 20,
        containsAllergens: []
    });
    await product.save();
    
    const firstInstance = await Product.findById(product._id);
    const secondInstance = await Product.findById(product._id);

    firstInstance!.set({ priceDZD: 1200 });
    secondInstance!.set({ priceDZD: 1300 });
    
    await firstInstance!.save();
    
    try {
        await secondInstance!.save();
    } catch (error) {
        return;
    }
    
    throw new Error('Should not reach this point');
});

it('increments the version number on multiple saves', async () => {
        const product = Product.build({
        title: 'Test Product',
        description: 'A product for testing OCC',
        priceDZD: 1000,
        images: ['http://example.com/image1.jpg'],
        nutritionTableImage: 'http://example.com/nutrition.jpg',
        category: ProductCategory.SNACK,
        vendorId: 'vendor123',
        calories: 500,
        proteinGrams: 30,
        carbsGrams: 50,
        fatGrams: 20,
        containsAllergens: []
    });
    await product.save();
    expect(product.version).toEqual(0);
    product.set({ priceDZD: 1100 });
    await product.save();
    expect(product.version).toEqual(1);
    product.set({ priceDZD: 1200 });
    await product.save();
    expect(product.version).toEqual(2);
})
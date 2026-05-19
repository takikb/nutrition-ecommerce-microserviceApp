import express, { Request, Response } from 'express';
import { Product, Allergy, ProductCategory, MedicalCondition } from '../models/product';
import { body } from 'express-validator';
import { validateRequest, NotFoundError, BadRequestError, requireAuth, NotAuthorizedError, ProductVerificationStatus } from '@d-ziet/common-lib';
import { ProductUpdatedPublisher } from '../events/publishers/product-updated-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.put('/api/products/:id', requireAuth, [
    body('title')
        .not()
        .isEmpty()
        .withMessage('Title is required'),
    body('description')
        .notEmpty()
        .isLength({ min: 10, max: 500 })
        .withMessage('Description is required'),
    body('priceDZD')
        .not()
        .isEmpty()
        .withMessage('Price is required')
        .isFloat({ gt: 0 })
        .withMessage('Price must be a positive number'),
    body('category')
        .notEmpty()
        .isIn(Object.values(ProductCategory))
        .withMessage('Invalid category'),
    body('images')
        .isArray({ min: 1 })
        .withMessage('At least one image is required'),
    body('nutritionTableImage')
        .notEmpty()
        .withMessage('Nutrition table image is required'),
    body('calories')
        .notEmpty()
        .isFloat({ gt: 0, lt: 10000 })
        .withMessage('Calories must be a value between 0 and 10000'),
    body('proteinGrams')
        .notEmpty()
        .isFloat({ gt: 0, lt: 1000 })
        .withMessage('Protein grams must be a value between 0 and 1000'),
    body('carbsGrams')
        .notEmpty()
        .isFloat({ gt: 0, lt: 1000 })
        .withMessage('Carbs grams must be a value between 0 and 1000'),
    body('fatGrams')
        .notEmpty()
        .isFloat({ gt: 0, lt: 1000 })
        .withMessage('Fat grams must be a value between 0 and 1000'),
    body('containsAllergens')
        .isArray()
        .isIn(Object.values(Allergy))
        .withMessage('Contains allergens must be an array'),
    body('MedicalCondition')
        .isArray()
        .isIn(Object.values(MedicalCondition))
        .withMessage('Medical conditions must be an array'),
], validateRequest, async (req: Request, res: Response) => {

    const product = await Product.findById(req.params.id)
    const { title, description, priceDZD, images, nutritionTableImage, category, calories, proteinGrams, carbsGrams, fatGrams, containsAllergens, MedicalCondition } = req.body;

    if (!product) {
        throw new NotFoundError();
    }

    if (product.vendorId !== req.currentUser!.id) {
        throw new NotAuthorizedError();
    }

    //if the product is rejected
    if (product.verificationStatus === ProductVerificationStatus.REJECTED) {
        throw new BadRequestError('Rejected products cannot be updated. Please create a brand new product submission.');
    }

    product.set({
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
        containsAllergens,
        MedicalCondition
    });
    await product.save();

    await new ProductUpdatedPublisher(natsWrapper.client).publish({
        id: product._id.toString(),
        version: product.version,
        title: product.title,
        description: product.description,
        priceDZD: product.priceDZD,

        images: product.images,
        nutritionTableImage: product.nutritionTableImage,
            
        // TypeScript Enums sometimes need to be casted when coming from Mongoose Docs
        category: product.category as any,
        vendorId: product.vendorId,
        calories: product.calories,
        proteinGrams: product.proteinGrams,
        carbsGrams: product.carbsGrams,
        fatGrams: product.fatGrams,
        containsAllergens: product.containsAllergens,
        MedicalCondition: product.MedicalCondition,

        verificationStatus: product.verificationStatus,
        status: product.status,
        targetGoals: product.targetGoals
    });

    res.send(product)
})

export { router as updateProductRouter }
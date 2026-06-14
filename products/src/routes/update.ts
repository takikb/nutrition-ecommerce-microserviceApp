import express, { Request, Response } from 'express';
import { Product, ProductCategory } from '../models/product';
import { body } from 'express-validator';
import { validateRequest, Allergy, NotFoundError, BadRequestError, requireAuth, NotAuthorizedError, ProductVerificationStatus, requireRole } from '@d-ziet/common-lib';
import { ProductUpdatedPublisher } from '../events/publishers/product-updated-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.put('/api/products/:id', requireAuth, requireRole(['vendor']), [
    body('title').not().isEmpty().withMessage('Title is required'),
    body('description')
      .isLength({ min: 10, max: 500 })
      .withMessage('Description must be between 10 and 500 characters'),
    body('priceDZD')
      .isFloat({ gt: 0 })
      .withMessage('Price must be a positive number'),
    body('category').not().isEmpty().withMessage('Category is required'),
    body('images')
      .isArray({ min: 1 })
      .withMessage('At least one product image is required'),
    body('nutritionTableImage')
      .not()
      .isEmpty()
      .withMessage('Nutrition label image is required'),
    body('calories')
      .isFloat({ gt: 0 })
      .withMessage('Calories must be greater than 0'),
    body('proteinGrams')
      .isFloat({ gt: 0 })
      .withMessage('Protein must be greater than 0'),
    body('carbsGrams')
      .isFloat({ gt: 0 })
      .withMessage('Carbohydrates must be greater than 0'),
    body('fatGrams')
      .isFloat({ gt: 0 })
      .withMessage('Fats must be greater than 0'),
  ], validateRequest, async (req: Request, res: Response) => {

    const product = await Product.findById(req.params.id)
    const {
        title,
        description,
        priceDZD,
        category,
        images,
        nutritionTableImage,
        calories,
        proteinGrams,
        carbsGrams,
        fatGrams,
        containsAllergens,
        } = req.body;

    if (!product) {
        throw new NotFoundError();
    }

    if (product.vendorId !== req.currentUser!.id) {
        throw new NotAuthorizedError();
    }

    product.set({
        title,
        description,
        priceDZD,
        category,
        images,
        nutritionTableImage,
        calories,
        proteinGrams,
        carbsGrams,
        fatGrams,
        containsAllergens: containsAllergens || ['none'],
        verificationStatus: 'pending', // Re-verify on edit [4]
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

        verificationStatus: product.verificationStatus,
        status: product.status,
        targetGoals: product.targetGoals
    });

    res.send(product)
})

export { router as updateProductRouter }
import express, { Request, Response } from 'express'
import { body } from 'express-validator'
import { requireAuth, validateRequest } from '@d-ziet/common-lib'
import { ProductCategory, Allergy } from '../models/product'
import { Product } from '../models/product'

const router = express.Router()

router.post('/api/products', requireAuth, [
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
        .withMessage('Contains allergens must be an array')

], validateRequest, async (req: Request, res: Response) => {
    const { title, description, priceDZD, images, nutritionTableImage, category, calories, proteinGrams, carbsGrams, fatGrams, containsAllergens } = req.body;

    const product = Product.build({
        title,
        description,
        priceDZD,
        images,
        nutritionTableImage,
        category,
        vendorId: req.currentUser!.id,
        calories,
        proteinGrams,
        carbsGrams,
        fatGrams,
        containsAllergens
    });
    await product.save();

    res.status(201).send(product);
})

export { router as newProductRouter }
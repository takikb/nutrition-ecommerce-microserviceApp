import express, { Request, Response } from 'express';
import { requireAuth, requireRole, NotFoundError, validateRequest } from '@d-ziet/common-lib';
import { body } from 'express-validator';
import { Product, ProductVerificationStatus } from '../models/product';
import { natsWrapper } from '../nats-wrapper';
import { ProductCreatedPublisher } from '../events/publishers/product-created-publisher';

const router = express.Router();

router.put('/api/products/:id/verify', 
    requireAuth, 
    requireRole(['admin']), 
    [
        body('status')
            .isIn([ProductVerificationStatus.APPROVED, ProductVerificationStatus.REJECTED])
            .withMessage('Invalid verification status'),
        body('rejectionReason')
            .if(body('status').equals(ProductVerificationStatus.REJECTED))
            .notEmpty()
            .withMessage('A reason is required for rejection')
    ],
    validateRequest,
    async (req: Request, res: Response) => {
        const product = await Product.findById(req.params.id);

        if (!product) {
            throw new NotFoundError();
        }

        const { status, rejectionReason } = req.body;

        product.set({
            verificationStatus: status,
            rejectionReason: status === ProductVerificationStatus.REJECTED ? rejectionReason : undefined,
            rejectedAt: status === ProductVerificationStatus.REJECTED ? new Date() : undefined
        });

        await product.save();

        // Broadcast the update so Chat/Orders know the product is now "Approved" so they can add it to their db

        await new ProductCreatedPublisher(natsWrapper.client).publish({
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
            targetGoals: product.targetGoals,

            rejectedAt: product.rejectedAt,
            rejectionReason: product.rejectionReason,
            
        });
        res.send(product);
    }
);

export { router as verifyProductRouter };
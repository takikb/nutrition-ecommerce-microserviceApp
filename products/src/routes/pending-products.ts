import express, { Request, Response } from 'express';
import { NotFoundError, requireAuth, validateRequest, requireRole, NotAuthorizedError } from '@d-ziet/common-lib';
import { Product, ProductVerificationStatus } from '../models/product';

const router = express.Router();

router.get('/api/products/admin/pending', requireAuth, requireRole(['admin']), async (req: Request, res: Response) => {
    const pendingProducts = await Product.find({ verificationStatus: ProductVerificationStatus.PENDING });

    res.send({ pendingProducts });
});

export {router as pendingProductsRouter}
import express, { Request, Response } from 'express';
import { NotFoundError, requireAuth, validateRequest, requireRole, NotAuthorizedError } from '@d-ziet/common-lib';
import { Product } from '../models/product';

const router = express.Router();

router.get('/api/products/admin/pending', requireAuth, requireRole(['admin']), async (req: Request, res: Response) => {
    const pendingProducts = await Product.find({ verificationStatus: 'pending' });

    res.send({ pendingProducts });
});

export {router as pendingProductsRouter}
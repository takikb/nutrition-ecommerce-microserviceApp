import express, { Request, Response } from 'express';
import { requireAuth, requireRole } from '@d-ziet/common-lib';
import { Product } from '../models/product';

const router = express.Router();

router.get('/api/products/my-products', requireAuth, requireRole(['vendor']), async (req: Request, res: Response) => {
    const products = await Product.find({ vendorId: req.currentUser!.id });

    res.send(products);
});

export { router as myProductsRouter };
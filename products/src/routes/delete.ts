import express, { Request, Response } from 'express';
import { Product, ProductStatus } from '../models/product';
import { NotFoundError, requireAuth, NotAuthorizedError } from '@d-ziet/common-lib';
import { ProductDeletedPublisher } from '../events/publishers/product-deleted-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.delete('/api/products/:id', requireAuth, async (req: Request, res: Response) => {

    const product = await Product.findById(req.params.id)
    
    if (!product) {
        throw new NotFoundError();
    }

    const isOwner = product.vendorId === req.currentUser!.id;
    const isAdmin = req.currentUser!.role === 'admin';

    if (!isOwner && !isAdmin) {
        throw new NotAuthorizedError();
    }

    product.set({
        status: ProductStatus.DELETED,
        isAvailable: false
    });
    await product.save();

    await new ProductDeletedPublisher(natsWrapper.client).publish({
        id: product._id.toString(),
        version: product.version
    });

    res.status(204).send(product);
})

export { router as deleteProductRouter }
import mongoose from 'mongoose'
import express, { Request, Response } from 'express'
import { Product } from '../models/product'
import { NotFoundError } from '@d-ziet/common-lib'

const router = express.Router()

router.get('/api/products/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    
    if (!id || typeof id !== 'string' || !mongoose.Types.ObjectId.isValid(id)) {
        throw new NotFoundError(); // Stop query immediately and return 404 [4]
    }
    const product = await Product.findById(id);

    if (!product) {
        throw new NotFoundError();
    }

    res.status(200).send(product);
})

export { router as showProductRouter }
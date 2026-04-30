import express, { Request, Response } from 'express'
import { Product } from '../models/product'
import { NotFoundError } from '@d-ziet/common-lib'

const router = express.Router()

router.get('/api/products/:id', async (req: Request, res: Response) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        throw new NotFoundError();
    }

    res.status(200).send(product);
})

export { router as showProductRouter }
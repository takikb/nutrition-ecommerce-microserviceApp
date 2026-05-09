import mongoose from 'mongoose';
import express, {Request, Response} from 'express';
import { requireAuth, validateRequest } from '@d-ziet/common-lib';
import { body } from 'express-validator';

const router = express.Router();

router.post('/api/orders', requireAuth, [
    body('productId')
        .not()
        .isEmpty()
        .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
        .withMessage('ProductId must be provided and must be a valid MongoDB ObjectId')
], validateRequest, (req: Request, res: Response) => {
    res.send({})
});

export {router as newOrderRouter}
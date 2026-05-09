import express, {Request, Response} from 'express';
import { NotFoundError, requireAuth, validateRequest, requireRole } from '@d-ziet/common-lib';
import { Order } from '../models/order';

const router = express.Router();

router.get('/api/orders', 
    requireAuth,
    requireRole(['customer']), 
    async (req: Request, res: Response) => {

        const orders = await Order.find({
            userId: req.currentUser!.id
        }).populate('product');

    res.send(orders);
});

export {router as indexOrderRouter}
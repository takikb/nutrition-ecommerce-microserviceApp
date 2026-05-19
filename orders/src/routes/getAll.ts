import express, { Request, Response } from 'express';
import { requireAuth, requireRole } from '@d-ziet/common-lib';
import { Order } from '../models/order';

const router = express.Router();

router.get('/api/orders/admin/all', requireAuth, requireRole(['admin']), async (req: Request, res: Response) => {
    const orders = await Order.find({}).populate('product');

    res.send({ orders });
});

export {router as getAllOrdersRouter}
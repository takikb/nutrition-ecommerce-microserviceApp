import express, {Request, Response} from 'express';
import { NotFoundError, requireAuth, validateRequest, requireRole, NotAuthorizedError } from '@d-ziet/common-lib';
import { Order } from '../models/order';

const router = express.Router();

router.get('/api/orders/:orderId',requireAuth, requireRole(['customer']), async (req: Request, res: Response) => {
    const order = await Order.findById(req.params.orderId).populate('product');
    
    if (!order) {
        throw new NotFoundError();
    }
    if (order.userId !== req.currentUser!.id) {
        throw new NotAuthorizedError();
    }

    res.send({ order });
});

export {router as showOrderRouter}
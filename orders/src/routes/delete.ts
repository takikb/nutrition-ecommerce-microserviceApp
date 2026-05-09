import express, {Request, Response} from 'express';
import { OrderStatus } from '@d-ziet/common-lib';
import { NotFoundError, requireAuth, NotAuthorizedError, requireRole } from '@d-ziet/common-lib';
import { Order } from '../models/order';

const router = express.Router();

router.delete('/api/orders/:orderId',requireAuth, requireRole(['customer']), async (req: Request, res: Response) => {
    const {orderId} = req.params;

    const order = await Order.findById(orderId);

    if (!order) {
        throw new NotFoundError();
    }
    if (order.userId !== req.currentUser!.id) {
        throw new NotAuthorizedError();
    }

    order.status = OrderStatus.Cancelled;
    await order.save();

    //publish an event saying that the order is cancelled

    res.status(204).send(order);
});

export {router as deleteOrderRouter}
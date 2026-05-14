import express, {Request, Response} from 'express';
import { OrderStatus } from '@d-ziet/common-lib';
import { NotFoundError, requireAuth, NotAuthorizedError, requireRole } from '@d-ziet/common-lib';
import { Order } from '../models/order';
import { OrderCancelledPublisher } from '../events/publishers/order-cancelled-publisher';
import { natsWrapper } from '../nats-wrapper';

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
    await new OrderCancelledPublisher(natsWrapper.client).publish({
        id: JSON.stringify(order._id),
        version: order.version,
        status: order.status,
        userId: order.userId,
        product: {
            id: JSON.stringify(order.product._id),
            title: order.product.title,
            priceDZD: order.product.priceDZD,
            vendorId: order.product.vendorId
        },
    });

    res.status(204).send(order);
});

export {router as deleteOrderRouter}
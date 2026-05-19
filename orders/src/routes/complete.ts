import mongoose from 'mongoose';
import express, {Request, Response} from 'express';
import { NotFoundError, requireAuth, validateRequest, requireRole, NotAuthorizedError, BadRequestError } from '@d-ziet/common-lib';
import { OrderStatus } from '@d-ziet/common-lib';
import { Product } from '../models/product';
import { Order } from '../models/order';
import { natsWrapper } from '../nats-wrapper';
import { OrderCompletedPublisher } from '../events/publishers/order-completed-publisher';

const router = express.Router();

router.put('/api/orders/:orderId', requireAuth, requireRole(['vendor']), async (req: Request, res: Response) => {
    const { orderId } = req.params;

    const order = await Order.findById(orderId).populate('product');

    if (!order) {
        throw new NotFoundError();
    }

    if (order.product.vendorId !== req.currentUser!.id) {
        throw new NotAuthorizedError();
    }
    
    if (order.status === OrderStatus.Cancelled) {
        throw new BadRequestError('Cannot complete a cancelled order');
    }

    if (order.status === OrderStatus.Complete) {
        throw new BadRequestError('Order is already completed');
    }

    order.set({ status: OrderStatus.Complete });
    await order.save();

    // Publish an event saying that an order is complete
    await new OrderCompletedPublisher(natsWrapper.client).publish({
        id: order.id,
        version: order.version,
        status: order.status,
        userId: order.userId,
        product: {
            id: order.product._id.toString(),
            title: order.product.title,
            priceDZD: order.product.priceDZD,
            vendorId: order.product.vendorId
        }
    });

    res.status(200).send(order);
});

export {router as completeOrderRouter}
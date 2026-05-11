import mongoose from 'mongoose';
import express, {Request, Response} from 'express';
import { NotFoundError, requireAuth, validateRequest, requireRole } from '@d-ziet/common-lib';
import { body } from 'express-validator';
import { OrderStatus } from '@d-ziet/common-lib';
import { Product } from '../models/product';
import { Order } from '../models/order';
import { OrderCreatedPublisher } from '../events/publishers/order-created-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.post('/api/orders', requireAuth,
    requireRole(['customer']), [
    body('productId')
        .not()
        .isEmpty()
        .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
        .withMessage('ProductId must be provided and must be a valid MongoDB ObjectId')
], validateRequest, 
async (req: Request, res: Response) => {
    const { productId } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
        throw new NotFoundError();
    }

    const order = Order.build({
        userId: req.currentUser!.id,
        status: OrderStatus.Created,
        product
    });
    await order.save();

    // Publish an event saying that an order was created
    await new OrderCreatedPublisher(natsWrapper.client).publish({
        id: JSON.stringify(order._id),
        status: order.status,
        userId: order.userId,
        product: {
            id: product.id,
            title: product.name,
            priceDZD: product.priceDZD
        },
    });

    res.status(201).send(order);
});

export {router as newOrderRouter}
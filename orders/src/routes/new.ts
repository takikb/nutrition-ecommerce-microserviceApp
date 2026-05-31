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
        .withMessage('ProductId must be provided and must be a valid MongoDB ObjectId'),
    body('quantity')
        .not()
        .isEmpty()
        .isInt({ min: 1 })
        .withMessage('Quantity must be a positive integer'),
    body('deliveryAddress')
        .not()
        .isEmpty()
        .withMessage('Delivery address must be provided'),
    body('phoneNumber')
        .not()
        .isEmpty()
        .withMessage('Phone number must be provided')
], validateRequest, 
async (req: Request, res: Response) => {
    const { productId, quantity, deliveryAddress, phoneNumber } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
        throw new NotFoundError(); 

    }

    const order = Order.build({
        userId: req.currentUser!.id,
        status: OrderStatus.Created,
        vendorId: product.vendorId,
        product,
        quantity,
        deliveryAddress,
        phoneNumber,
        totalPriceDZD: product.priceDZD * quantity
    });
    await order.save();

    // Publish an event saying that an order was created
    await new OrderCreatedPublisher(natsWrapper.client).publish({
        id: JSON.stringify(order._id),
        version: order.version,
        status: order.status,
        userId: order.userId,
        vendorId: order.vendorId,
        product: {
            id: product.id,
            title: product.title,
            priceDZD: product.priceDZD,
            vendorId: product.vendorId
        },
        quantity: order.quantity,
        deliveryAddress: order.deliveryAddress,
        phoneNumber: order.phoneNumber,
        totalPriceDZD: order.totalPriceDZD
    });

    res.status(201).send(order);
});

export {router as newOrderRouter}
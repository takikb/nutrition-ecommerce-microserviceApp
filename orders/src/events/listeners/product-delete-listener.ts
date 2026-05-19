import { Message } from 'node-nats-streaming';
import { Subjects, Listener, OrderStatus, ProductDeletedEvent } from '@d-ziet/common-lib';
import { Order } from '../../models/order';
import { queueGroupName } from './queue-group-name';
import { OrderCancelledPublisher } from '../publishers/order-cancelled-publisher';
import { natsWrapper } from '../../nats-wrapper';

export class ProductDeletedListener extends Listener<ProductDeletedEvent> {
    subject: Subjects.ProductDeleted = Subjects.ProductDeleted
    queueGroupName = queueGroupName;

    async onMessage(data: ProductDeletedEvent['data'], msg: Message) {
        const { id } = data;

        const ActiveOrders = await Order.find({
            'product': id,
            'status': OrderStatus.Created
        });

        for (let order of ActiveOrders) {
            order.set({ status: OrderStatus.Cancelled });
            await order.save();

            await new OrderCancelledPublisher(natsWrapper.client).publish({
                id: order.id,
                version: order.version,
                status: order.status,
                userId: order.userId,
                product: {
                    id: order.product._id.toString(),
                    title: order.product.title,
                    priceDZD: order.product.priceDZD,
                    vendorId: order.product.vendorId
                },
            });
        }

        msg.ack();
    }
}

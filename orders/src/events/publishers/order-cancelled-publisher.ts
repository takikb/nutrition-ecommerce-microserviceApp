import { Subjects, Publisher, OrderCancelledEvent } from '@d-ziet/common-lib';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
    subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
}
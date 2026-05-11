import { Publisher, OrderCreatedEvent, Subjects } from '@d-ziet/common-lib';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
    subject: Subjects.OrderCreated = Subjects.OrderCreated;
}
import { Publisher, OrderCompletedEvent, Subjects } from '@d-ziet/common-lib';

export class OrderCompletedPublisher extends Publisher<OrderCompletedEvent> {
    subject: Subjects.OrderCompleted = Subjects.OrderCompleted;
}
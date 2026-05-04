import { Publisher, Subjects, ProductCreatedEvent } from '@d-ziet/common-lib';

export class ProductCreatedPublisher extends Publisher<ProductCreatedEvent> {
    subject: Subjects.ProductCreated = Subjects.ProductCreated;
}
import { Publisher, Subjects, ProductUpdatedEvent } from '@d-ziet/common-lib';

export class ProductUpdatedPublisher extends Publisher<ProductUpdatedEvent> {
    subject: Subjects.ProductUpdated = Subjects.ProductUpdated;
}
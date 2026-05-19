import { Publisher, Subjects, ProductDeletedEvent } from "@d-ziet/common-lib";

export class ProductDeletedPublisher extends Publisher<ProductDeletedEvent> {
    subject: Subjects.ProductDeleted = Subjects.ProductDeleted;
}
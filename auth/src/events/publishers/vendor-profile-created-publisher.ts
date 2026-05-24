import { Publisher, Subjects, VendorProfileCreatedEvent } from '@d-ziet/common-lib';

export class VendorProfileCreatedPublisher extends Publisher<VendorProfileCreatedEvent> {
    subject: Subjects.VendorProfileCreated = Subjects.VendorProfileCreated;
}
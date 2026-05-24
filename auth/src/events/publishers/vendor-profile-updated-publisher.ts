import { Publisher, Subjects, VendorProfileUpdatedEvent } from '@d-ziet/common-lib';

export class VendorProfileUpdatedPublisher extends Publisher<VendorProfileUpdatedEvent> {
    subject: Subjects.VendorProfileUpdated = Subjects.VendorProfileUpdated;
}
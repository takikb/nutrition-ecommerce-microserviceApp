import { Publisher, Subjects, HealthProfileUpdatedEvent } from '@d-ziet/common-lib';

export class HealthProfileUpdatedPublisher extends Publisher<HealthProfileUpdatedEvent> {
    subject: Subjects.HealthProfileUpdated = Subjects.HealthProfileUpdated;
}
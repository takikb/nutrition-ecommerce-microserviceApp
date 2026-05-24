import { Publisher, Subjects, HealthProfileCreatedEvent } from '@d-ziet/common-lib';

export class HealthProfileCreatedPublisher extends Publisher<HealthProfileCreatedEvent> {
    subject: Subjects.HealthProfileCreated = Subjects.HealthProfileCreated;
}
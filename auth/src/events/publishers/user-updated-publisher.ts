import { Publisher, Subjects, UserUpdatedEvent } from '@d-ziet/common-lib';

export class UserUpdatedPublisher extends Publisher<UserUpdatedEvent> {
    subject: Subjects.UserUpdated = Subjects.UserUpdated;
}
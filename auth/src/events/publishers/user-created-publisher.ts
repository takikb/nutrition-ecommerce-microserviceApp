import { Publisher, Subjects, UserCreatedEvent } from '@d-ziet/common-lib';

export class UserCreatedPublisher extends Publisher<UserCreatedEvent> {
    subject: Subjects.UserCreated = Subjects.UserCreated;
}
import { Message } from "node-nats-streaming";
import { Listener, Subjects, UserCreatedEvent } from "@d-ziet/common-lib";
import { User } from "../../models/user";
import { queueGroupName } from "./queue-group-name";

export class UserCreatedListener extends Listener<UserCreatedEvent> {
    subject: Subjects.UserCreated = Subjects.UserCreated;
    queueGroupName = queueGroupName;

    async onMessage(data: UserCreatedEvent['data'], msg: Message) {
        const { id, fullName, role } = data;

        try {
            const existingUser = await User.findById(id);
            if (existingUser) {
                return msg.ack();
            }

            const user = User.build({
                id,
                fullName,
                role
            });
            await user.save();

            msg.ack();
        } catch (err) {
            console.error("Error replicating UserCreatedEvent in Chat service:", err);
        }
    }
}
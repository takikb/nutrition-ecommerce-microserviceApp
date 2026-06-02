import { Message } from "node-nats-streaming";
import { Listener, Subjects, UserUpdatedEvent } from "@d-ziet/common-lib";
import { User } from "../../models/user";
import { queueGroupName } from "./queue-group-name";

export class UserUpdatedListener extends Listener<UserUpdatedEvent> {
    subject: Subjects.UserUpdated = Subjects.UserUpdated;
    queueGroupName = queueGroupName;

    async onMessage(data: UserUpdatedEvent['data'], msg: Message) {
        const { id, fullName, role } = data;

        try {
            // Find sequential version record to prevent out-of-order overrides
            const user = await User.findByEvent(data);

            if (!user) {
                const existingUser = await User.findById(id);
                if (existingUser) {
                    throw new Error(`Out of order user update. DB version: ${existingUser.version}, Event version: ${data.version}`);
                }

                // Fallback build if user doesn't exist locally yet
                const newUser = User.build({ id, fullName, role });
                await newUser.save();
                return msg.ack();
            }

            user.set({ fullName, role });
            await user.save();

            msg.ack();
        } catch (err) {
            console.error("Error replicating UserUpdatedEvent in Chat service:", err);
        }
    }
}
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
            // 1.Check if the replica already exists
            const existingUser = await User.findById(id);
            if (existingUser && data.version <= existingUser.version) {
                // If the event is a duplicate or has the same version, update and ack to break the loop
                existingUser.set({ fullName, role });
                await existingUser.save();
                return msg.ack();
            }

            // 2. Find sequential version record to prevent out-of-order overrides
            const user = await User.findByEvent(data);

            if (!user) {
                if (existingUser) {
                    // Out-of-order sequence check (e.g., received v2 when database is on v0) 
                    // We throw an error and DO NOT call msg.ack() so NATS retries later 
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
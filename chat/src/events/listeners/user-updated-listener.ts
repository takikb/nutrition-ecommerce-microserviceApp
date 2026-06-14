import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { Listener, Subjects, UserUpdatedEvent } from "@d-ziet/common-lib";
import { User } from "../../models/user";
import { queueGroupName } from "./queue-group-name";

export class UserUpdatedListener extends Listener<UserUpdatedEvent> {
    subject: Subjects.UserUpdated = Subjects.UserUpdated;
    queueGroupName = queueGroupName;

    async onMessage(data: UserUpdatedEvent['data'], msg: Message) {
        const { id, fullName, role, version } = data;

        try {
            const existingUser = await User.findById(id);

            if (existingUser) {
                // If event is newer, update and align version 
                if (version > existingUser.version) {
                    const objectId = new mongoose.Types.ObjectId(id); // Cast to raw ObjectId 

                    // Executing raw MongoDB driver write to completely bypass Mongoose OCC 
                    await User.collection.updateOne(
                        { _id: objectId },
                        { $set: { fullName, role, version } }
                    );
                }
                return msg.ack();
            }

            // Fallback build if user doesn't exist locally yet 
            const newUser = User.build({ id, fullName, role });
            newUser.set({ version });
            await newUser.save();

            msg.ack();
        } catch (err: any) {
            console.error("User Sync Error:", err.message);
        }
    }
}
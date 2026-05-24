import { Subjects } from "./subjects";
import { UserRole } from "./types/user";

export interface UserUpdatedEvent {
    subject: Subjects.UserUpdated;
    data: {
        id: string;
        version: number;
        email: string;
        fullName: string;
        role: UserRole;
        isActive: boolean;
        createdAt?: Date;
        updatedAt?: Date;
    };
}
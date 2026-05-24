import { Subjects } from "./subjects";
import { UserRole } from "./types/user";

export interface UserCreatedEvent {
    subject: Subjects.UserCreated;
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
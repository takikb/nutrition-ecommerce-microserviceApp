import { Subjects } from "./subjects";

export interface VendorProfileCreatedEvent {
    subject: Subjects.VendorProfileCreated;
    data: {
        id: string
        userId: string
        version: number
        displayName: string
        bio?: string
        phoneNumber: string
        location: {
            address: string
            wilaya: string
        }
        rating?: number
        totalsales?: number
        isSuspended?: boolean
        createdAt?: Date
        updatedAt?: Date
    };
}
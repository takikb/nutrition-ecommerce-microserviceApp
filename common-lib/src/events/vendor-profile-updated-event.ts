import { Subjects } from "./subjects";

export interface VendorProfileUpdatedEvent {
    subject: Subjects.VendorProfileUpdated;
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
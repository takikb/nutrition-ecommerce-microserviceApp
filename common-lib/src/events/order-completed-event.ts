import { Subjects } from "./subjects";

export interface OrderCompletedEvent {
    subject: Subjects.OrderCompleted;
    data: {
        id: string;
        version: number;
        userId: string;
        status: string;
        product: {
            id: string;
            title: string;
            priceDZD: number;
            vendorId: string;
        }
    }
}
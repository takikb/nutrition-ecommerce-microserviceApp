import { Subjects } from "./subjects";

export interface OrderCancelledEvent {
    subject: Subjects.OrderCancelled;
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
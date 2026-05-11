import { Subjects } from "./subjects";

export interface OrderCreatedEvent {
    subject: Subjects.OrderCreated;
    data: {
        id: string;
        userId: string;
        status: string;
        product: {
            id: string;
            title: string;
            priceDZD: number;
        }
    }
}
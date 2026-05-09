import mongoose from "mongoose";
import { OrderStatus } from '@d-ziet/common-lib'
import { ProductDoc } from "./product";

interface OrderAttrs {
    userId: string;
    status: OrderStatus;
    product: ProductDoc;
}

interface OrderDoc extends mongoose.Document {
    userId: string;
    status: OrderStatus;
    product: ProductDoc;
}

interface OrderModel extends mongoose.Model<OrderDoc> {
    build(attrs: OrderAttrs): OrderDoc
}

const orderSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: Object.values(OrderStatus),
        default: OrderStatus.Created
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    }
}, {
    timestamps: true
});

orderSchema.statics.build = (attrs: OrderAttrs) => {
    return new Order(attrs);
}

const Order = mongoose.model<OrderDoc, OrderModel>('Order', orderSchema);

export { Order }
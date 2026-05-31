import mongoose from "mongoose";
import { OrderStatus } from '@d-ziet/common-lib'
import { ProductDoc } from "./product";

interface OrderAttrs {
    userId: string;
    vendorId: string;
    status: OrderStatus;
    product: ProductDoc;
    quantity: number;
    deliveryAddress: string;
    phoneNumber: string;
    totalPriceDZD: number;
}

interface OrderDoc extends mongoose.Document {
    userId: string;
    vendorId: string;
    status: OrderStatus;
    product: ProductDoc;
    quantity: number;
    deliveryAddress: string;
    phoneNumber: string;
    totalPriceDZD: number;
    version: number;
}

interface OrderModel extends mongoose.Model<OrderDoc> {
    build(attrs: OrderAttrs): OrderDoc
}

const orderSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    vendorId: {
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
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
        default: 1
    },
    deliveryAddress: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    totalPriceDZD: {
        type: Number,
        required: true,
        min: 0
    }
}, {
    timestamps: true,
    optimisticConcurrency: true,
    toJSON: {
        transform(doc, ret: any) {
            ret.id = ret._id;
            delete ret._id;
        }
    }
});
orderSchema.set('versionKey', 'version');

orderSchema.pre('save', function() {
    if (!this.isNew) {
        this.increment();
    }
});


orderSchema.statics.build = (attrs: OrderAttrs) => {
    return new Order(attrs);
}

const Order = mongoose.model<OrderDoc, OrderModel>('Order', orderSchema);

export { Order }
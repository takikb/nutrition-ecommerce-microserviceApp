import mongoose from "mongoose";

interface ProductAttrs {
    name: string;
    priceDZD: number;
}

export interface ProductDoc extends mongoose.Document{
    name: string;
    priceDZD: number;
}

interface ProductModel extends mongoose.Model<ProductDoc> {
    build(attrs: ProductAttrs): ProductDoc;
}

const productSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    priceDZD: { 
        type: Number, 
        required: true, 
        min: 0
    }
},{
    toJSON: {
        transform(doc, ret: any) {
            ret.id = ret._id;
            delete ret._id;
        }
    }
});

productSchema.statics.build = (attrs: ProductAttrs) => {
    return new Product(attrs);
}

const Product = mongoose.model<ProductDoc, ProductModel>('Product', productSchema);

export { Product };
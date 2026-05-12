import mongoose from "mongoose";

interface ProductAttrs {
    id: string;
    title: string;
    priceDZD: number;
}

export interface ProductDoc extends mongoose.Document{
    title: string;
    priceDZD: number;
    version: number;
}

interface ProductModel extends mongoose.Model<ProductDoc> {
    build(attrs: ProductAttrs): ProductDoc;
    findByEvent(event: {id: string, version: number}): Promise<ProductDoc | null>;
}

const productSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: true 
    },
    priceDZD: { 
        type: Number, 
        required: true, 
        min: 0
    }
},{
    optimisticConcurrency: true,
    toJSON: {
        transform(doc, ret: any) {
            ret.id = ret._id;
            delete ret._id;
        }
    }
});

productSchema.set('versionKey', 'version');

productSchema.pre('save', function() {
    if (!this.isNew) {
        this.increment();
    }
});

productSchema.statics.findByEvent = (event: {id: string, version: number}) => {
    return Product.findOne({
        _id: event.id,
        version: event.version - 1
    });
};

productSchema.statics.build = (attrs: ProductAttrs) => {
    return new Product({
        _id: attrs.id,
        title: attrs.title,
        priceDZD: attrs.priceDZD
    });
}

const Product = mongoose.model<ProductDoc, ProductModel>('Product', productSchema);

export { Product };
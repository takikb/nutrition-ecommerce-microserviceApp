import mongoose from "mongoose";

interface ProductAttrs {

}

interface ProductDoc extends mongoose.Document{

}

interface ProductModel extends mongoose.Model<ProductDoc> {
    
}
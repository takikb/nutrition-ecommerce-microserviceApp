import mongoose from 'mongoose';


export enum ProductCategory {
    MEAL_PREP = 'meal_prep',
    SNACK = 'snack',
    SUPPLEMENT = 'supplement',
    GROCERY = 'grocery',
    DRINK = 'drink'
}

export enum MedicalCondition {
    DIABETES_TYPE_1 = 'diabetes_type_1',
    DIABETES_TYPE_2 = 'diabetes_type_2',
    HYPERTENSION = 'hypertension',
    HIGH_CHOLESTEROL = 'high_cholesterol',
    CELIAC_DISEASE = 'celiac_disease',
    IBS = 'ibs',
    ANEMIA = 'anemia',
    THYROID_DISORDER = 'thyroid_disorder',
    PCOS = 'pcos',
    NONE = 'none'
}

export enum Allergy {
    LACTOSE = 'lactose',
    GLUTEN = 'gluten',
    PEANUTS = 'peanuts',
    TREE_NUTS = 'tree_nuts',
    EGGS = 'eggs',
    FISH = 'fish',
    SHELLFISH = 'shellfish',
    STRAWBERRY = 'strawberry',
    NONE = 'none'
}

export enum PrimaryHealthGoals {
    WEIGHT_LOSS = 'weight_loss',
    MUSCLE_GAIN = 'muscle_gain',
    MAINTENANCE = 'maintenance',
    IMPROVED_ENERGY = 'improved_energy'
}

export enum ProductVerificationStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected'
}

interface ProductAttrs {
    title: string;
    description: string;
    priceDZD: number;
    
    images: string[]; 
    nutritionTableImage: string; 
    
    category: ProductCategory;
    vendorId: string;
    calories: number;
    proteinGrams: number;
    carbsGrams: number;
    fatGrams: number;
    containsAllergens: Allergy[];
}

interface ProductModel extends mongoose.Model<ProductDoc> {
    build(attrs: ProductAttrs): ProductDoc;
}

interface ProductDoc extends mongoose.Document {
    title: string;
    description: string;
    priceDZD: number;
    images: string[];
    nutritionTableImage: string;
    category: ProductCategory;
    vendorId: string;
    calories: number;
    proteinGrams: number;
    carbsGrams: number;
    fatGrams: number;
    containsAllergens: Allergy[];
    
    // Status tracking
    verificationStatus: ProductVerificationStatus;
    
    aiAnalyzed: boolean;
    suitableForConditions: MedicalCondition[];
    targetGoals: PrimaryHealthGoals[];
    isAvailable: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const productSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    priceDZD: { type: Number, required: true, min: 0 },
    
    images:[{ type: String, required: true }],
    // Specific field for the proof
    nutritionTableImage: { type: String, required: true },
    
    category: { type: String, enum: Object.values(ProductCategory), required: true },
    vendorId: { type: String, required: true },
    
    calories: { type: Number, required: true, min: 0 },
    proteinGrams: { type: Number, required: true, min: 0 },
    carbsGrams: { type: Number, required: true, min: 0 },
    fatGrams: { type: Number, required: true, min: 0 },

    containsAllergens:[{ type: String, enum: Object.values(Allergy), default:[Allergy.NONE] }],

    // Default to pending!
    verificationStatus: { 
        type: String, 
        enum: Object.values(ProductVerificationStatus), 
        default: ProductVerificationStatus.PENDING 
    },

    aiAnalyzed: { type: Boolean, default: false },
    suitableForConditions:[{ type: String, enum: Object.values(MedicalCondition), default: [] }],
    targetGoals:[{ type: String, enum: Object.values(PrimaryHealthGoals), default: [] }],

    isAvailable: { type: Boolean, default: true }
}, {
    timestamps: true,
    toJSON: {
        transform(doc, ret: any) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
        }
    }
});

productSchema.statics.build = (attrs: ProductAttrs) => {
    return new Product(attrs);
};

const Product = mongoose.model<ProductDoc, ProductModel>('Product', productSchema);

export { Product };
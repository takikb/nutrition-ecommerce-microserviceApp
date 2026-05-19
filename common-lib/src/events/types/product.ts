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

// Vendor Product Lifecycle Status
export enum ProductStatus {
    DRAFT = 'draft',
    ACTIVE = 'active',
    SOLD_OUT = 'sold_out',
    ARCHIVED = 'archived',
    DELETED = 'deleted'
}
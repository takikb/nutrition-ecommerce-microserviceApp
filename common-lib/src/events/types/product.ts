export enum ProductCategory {
    MEAL_PREP = 'meal_prep',
    SNACK = 'snack',
    SUPPLEMENT = 'supplement',
    GROCERY = 'grocery',
    DRINK = 'drink'
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
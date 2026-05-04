import { Subjects } from "./subjects";

export enum ProductCategory {
    MEAL_PREP = 'meal_prep',
    SNACK = 'snack',
    SUPPLEMENT = 'supplement',
    GROCERY = 'grocery',
    DRINK = 'drink'
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

export interface ProductCreatedEvent {
    subject: Subjects.ProductCreated
    data: {
        id: string;
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
}
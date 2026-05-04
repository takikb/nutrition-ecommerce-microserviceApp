import { Subjects } from "./subjects";
import { ProductCategory, Allergy } from "./product-created-event";

export interface ProductUpdatedEvent {
    subject: Subjects.ProductUpdated
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
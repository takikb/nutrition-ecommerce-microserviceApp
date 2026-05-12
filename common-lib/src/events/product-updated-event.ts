import { Subjects } from "./subjects";
import { ProductCategory, Allergy } from "./types/product";

export interface ProductUpdatedEvent {
    subject: Subjects.ProductUpdated
    data: {
        id: string;
        version: number;
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
// product-updated-event.ts
import { Subjects } from "./subjects";
import { ProductCategory, Allergy, ProductStatus, ProductVerificationStatus, PrimaryHealthGoals, MedicalCondition } from "./types/product";

export interface ProductUpdatedEvent {
    subject: Subjects.ProductUpdated
    data: {
        // This is now identical to ProductCreatedEvent!
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
        MedicalCondition: MedicalCondition[]; 

        verificationStatus: ProductVerificationStatus;
        rejectionReason?: string; 
        status: ProductStatus;    
        rejectedAt?: Date;
        
        inquiryCount?: number;     

        aiAnalyzed?: boolean;
        targetGoals: PrimaryHealthGoals[];
        isAvailable?: boolean;
        createdAt?: Date;
        updatedAt?: Date;
    }
}
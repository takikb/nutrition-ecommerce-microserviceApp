// product-updated-event.ts
import { Subjects } from "./subjects";
import { ProductCategory, ProductStatus, ProductVerificationStatus } from "./types/product";
import { Allergy, MedicalCondition, PrimaryHealthGoals } from "./types/health-profile";

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
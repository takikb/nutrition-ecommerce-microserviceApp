import { Subjects } from "./subjects";
import { ProductCategory, ProductStatus, ProductVerificationStatus} from "./types/product";
import { Allergy, MedicalCondition, PrimaryHealthGoals } from "./types/health-profile";

export interface ProductCreatedEvent {
    subject: Subjects.ProductCreated
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
        
        verificationStatus: ProductVerificationStatus;
        
        rejectionReason?: string; // Why was it rejected?
        status: ProductStatus;    // Vendor's listing status
        rejectedAt?: Date;
        
        // Marketplace Metrics
        inquiryCount?: number;     // How many people clicked "Order"

        aiAnalyzed?: boolean;
        targetGoals: PrimaryHealthGoals[];
        isAvailable?: boolean;
        createdAt?: Date;
        updatedAt?: Date;
    }
}
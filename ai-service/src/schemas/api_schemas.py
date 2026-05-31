"""Pydantic models for json validation """
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
 
# 1 NATS EVENT PAYLOAD SCHEMAS (Matches Node.js JSON exactly)
class HealthProfileEventData(BaseModel):
    """Validates the JSON payload from HealthProfileCreated/Updated."""
    id: str
    userId: str
    version: int
    gender: str
    dateOfBirth: datetime
    heightCM: float
    weightKG: float
    calculatedBMI: float
    calculatedBMR: float
    calculatedTDEE: float
    activityLevel: str
    medicalCondition: List[str]
    allergy: List[str]
    primaryHealthGoal: str
    createdAt: Optional[datetime] = None
    updatedAt: Optional[datetime] = None

class UserEventData(BaseModel):
    """Validates the JSON payload from UserCreated/Updated."""
    id: str
    version: int
    email: str
    fullName: str
    role: str
    isActive: bool
    createdAt: Optional[datetime] = None
    updatedAt: Optional[datetime] = None

class VendorLocation(BaseModel):
    """Sub-schema for the Vendor's location object."""
    address: str
    wilaya: str

class VendorProfileEventData(BaseModel):
    """Validates the JSON payload from VendorProfileCreated/Updated."""
    id: str
    userId: str
    version: int
    displayName: str
    bio: Optional[str] = None
    phoneNumber: str
    location: VendorLocation
    rating: Optional[float] = 0
    totalsales: Optional[int] = 0
    isSuspended: Optional[bool] = False
    createdAt: Optional[datetime] = None
    updatedAt: Optional[datetime] = None

class ProductEventData(BaseModel):
    """Validates the JSON payload from ProductCreated/Updated."""
    id: str
    version: int
    title: str
    priceDZD: float
    calories: float
    proteinGrams: float
    carbsGrams: float
    fatGrams: float
    containsAllergens: List[str] = []
    MedicalCondition: List[str] = []
    images: List[str] = []
    isAvailable: Optional[bool] = True
    status: Optional[str] = None
    vendorId: Optional[str] = None
    category: Optional[str] = None
    verificationStatus: Optional[str] = 'pending' # pending, approved, rejected


# 2. API REQUEST & RESPONSE SCHEMAS (For the Next.js Frontend)

class RecommendationRequest(BaseModel):
    """What the frontend sends to get a feed."""
    user_id: str

class RecommendedProductResponse(BaseModel):
    """What the AI Service sends back to the frontend."""
    id: str
    title: str
    price_dzd: float
    calories: float
    protein_g: float
    carbs_g: float
    fats_g: float
    match_score: float # Percentage match from AI Stage 3
    recommended_portions: float # Added to display exact sizing to the user!
    images: List[str] = []


class TargetMacrosSchema(BaseModel):
    """The user's calculated daily targets based on their TDEE and goal."""
    target_calories: float
    target_protein: float
    target_carbs: float
    target_fats: float

class UserRecommendationsResponse(BaseModel):
    """The rich response containing both the nutritional dashboard targets and ranked meals."""
    target_macros: TargetMacrosSchema
    recommended_products: List[RecommendedProductResponse]
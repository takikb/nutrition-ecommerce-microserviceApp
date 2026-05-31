"""FastAPI Router for AI Recommendations."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

# Database
from src.database.database import get_db
from src.database.models import LocalHealthProfile, LocalProduct

# Schemas
from src.schemas.api_schemas import RecommendedProductResponse, UserRecommendationsResponse

# AI Pipeline Services
from src.services.nutrition_calc import calculate_target_macros
from src.services.stage1_rules import filter_safe_products
from src.services.stage2_cluster import predict_cluster
from src.services.stage3_ranking import rank_products

router = APIRouter(prefix="/api/v1/recommendations", tags=["Recommendations"])

@router.get("/{user_id}", response_model=UserRecommendationsResponse)
def get_user_feed(user_id: str, db: Session = Depends(get_db)):
    """Generates a real-time, personalized product feed and calculates macro targets."""
    
    # 1. Fetch User Data
    user = db.query(LocalHealthProfile).filter(LocalHealthProfile.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User Health Profile not found.")

    # 2. Calculate User's Target Macros (Stage 3 work)
    target_macros = calculate_target_macros(
        tdee=user.tdee, 
        goal=user.primary_health_goal, 
        gender=user.gender,
        medical_conditions=user.medical_conditions 
    )

    # 3. Predict Cluster and Fetch Products
    user_cluster_id = predict_cluster(target_macros)
    print(f"ML CLUSTER MATCH: User belongs to Cluster {user_cluster_id}.")

    
    # Using our temporary demo hack to bypass empty database clusters
    cluster_products = db.query(LocalProduct).filter(LocalProduct.is_available == True).all()

    if not cluster_products:
        return {
            "target_macros": target_macros,
            "recommended_products": []
        }

    # 4. Stage 1: Filter allergens
    safe_products, excluded_products = filter_safe_products(
        products=cluster_products,
        user_conditions=user.medical_conditions,
        user_allergies=user.allergies
    )

    # 5. Stage 3: Rank products via Cosine Similarity
    ranked_products = rank_products(user_macros=target_macros, products=safe_products)

    # 6. Format products list
    response_products = []
    for p in ranked_products[:10]:
        response_products.append({
            "id": p.id,
            "title": p.title,
            "price_dzd": p.price_dzd,
            "calories": p.calories,
            "protein_g": p.protein_g,
            "carbs_g": p.carbs_g,
            "fats_g": p.fats_g,
            "match_score": round(p.match_score * 100, 2),
            "recommended_portions": p.recommended_portions,
            "images": p.images
        })

    # 7. RETURN BOTH TARGETS AND RECOMMENDED PRODUCTS!
    return {
        "target_macros": {
            "target_calories": target_macros["target_calories"],
            "target_protein": target_macros["target_protein"],
            "target_carbs": target_macros["target_carbs"],
            "target_fats": target_macros["target_fats"]
        },
        "recommended_products": response_products
    }
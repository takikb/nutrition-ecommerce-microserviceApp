"""Stage 1: Programmatic Medical and Allergen Rule Engine."""

from __future__ import annotations
from src.database.models import LocalProduct

def filter_safe_products(
    products: list[LocalProduct], 
    user_conditions: list[str], 
    user_allergies: list[str]
) -> tuple[list[LocalProduct], list[dict]]:
    """
    Evaluates medical and allergen safety.
    Vendors only tag raw allergens. The AI evaluates medical conditions 
    dynamically on the fly based on macro ratios.
    """
    
    # 1. Standardize user strings to lowercase
    user_allergy_set = {a.lower().strip() for a in user_allergies if a.lower() != 'none'}
    user_condition_set = {c.lower().strip() for c in user_conditions if c.lower() != 'none'}

    # Celiac disease clinical mapping: Automatically treats as a strict gluten allergy
    if "celiac_disease" in user_condition_set:
        user_allergy_set.add("gluten")

    safe_products = []
    excluded_products = []

    for product in products:
        if not product.is_available:
            continue

        prod_allergies = {a.lower().strip() for a in product.contains_allergens if a.lower() != 'none'}
        
        # Pull raw macros as floats
        calories = float(product.calories)
        carbs = float(product.carbs_g)
        protein = float(product.protein_g)
        fats = float(product.fats_g)

        # -----------------------------------------------------------------
        # CHECK 1: DIRECT ALLERGEN FILTERING (Allergy & Celiac)
        # -----------------------------------------------------------------
        intersecting_allergies = user_allergy_set.intersection(prod_allergies)
        if intersecting_allergies:
            excluded_products.append({
                "product": product,
                "reason": f"Contains user allergen: {', '.join(intersecting_allergies)}"
            })
            continue

        # -----------------------------------------------------------------
        # CHECK 2: PROGRAMMATIC CLINICAL MACRO RULES
        # -----------------------------------------------------------------
        is_safe = True
        exclusion_reasons = []

        # A. Diabetes (Type 1 and Type 2)
        # Rule: Limit insulin spikes. Carbs <= 50% of calories, absolute carbs <= 60g.
        if "diabetes_type_1" in user_condition_set or "diabetes_type_2" in user_condition_set:
            carb_calories = carbs * 4.0
            if calories > 0 and (carb_calories / calories) > 0.50:
                is_safe = False
                exclusion_reasons.append("Diabetes: Carbohydrates exceed 50% of total calories")
            if carbs > 60.0:
                is_safe = False
                exclusion_reasons.append(f"Diabetes: Total carbohydrates ({carbs}g) exceed 60g single-meal limit")

        # B. Hypertension (High Blood Pressure)
        # Rule: Limit dietary fats linked to arterial plaque. Fats <= 30% of calories.
        if "hypertension" in user_condition_set:
            fat_calories = fats * 9.0
            if calories > 0 and (fat_calories / calories) > 0.30:
                is_safe = False
                exclusion_reasons.append("Hypertension: Fats exceed 30% of total calories")

        # C. High Cholesterol
        # Rule: Limit dietary fats. Fats <= 35% of calories.
        if "high_cholesterol" in user_condition_set:
            fat_calories = fats * 9.0
            if calories > 0 and (fat_calories / calories) > 0.35:
                is_safe = False
                exclusion_reasons.append("High Cholesterol: Fats exceed 35% of total calories")

        # D. IBS (Irritable Bowel Syndrome)
        # Rule: High fat triggers colon spasms. Limit fats <= 25% of calories, and restrict massive meal sizes (<= 700 kcal) to avoid gastric distension.
        if "ibs" in user_condition_set:
            fat_calories = fats * 9.0
            if calories > 0 and (fat_calories / calories) > 0.25:
                is_safe = False
                exclusion_reasons.append("IBS: Fats exceed 25% of total calories (high-fat triggers gut motility issues)")
            if calories > 700.0:
                is_safe = False
                exclusion_reasons.append(f"IBS: Total meal calories ({calories} kcal) exceed 700 kcal single-meal limit")

        # E. Anemia
        # Rule: Prevent nutrient-empty calories. Require a minimum protein density of at least 8g for any meal over 350 calories.
        if "anemia" in user_condition_set:
            if calories > 350.0 and protein < 8.0:
                is_safe = False
                exclusion_reasons.append(f"Anemia: Meal has low protein density ({protein}g protein for {calories} kcal)")

        # F. Thyroid Disorder
        # Rule: Stabilize thyroid function. Avoid ultra-processed sugar dumps. Carbs-to-Protein ratio must be <= 3.0, and Fats <= 35% of calories.
        if "thyroid_disorder" in user_condition_set:
            fat_calories = fats * 9.0
            if protein > 0 and (carbs / protein) > 3.0:
                is_safe = False
                exclusion_reasons.append("Thyroid Disorder: High refined glycemic profile (Carbs/Protein ratio > 3.0)")
            if calories > 0 and (fat_calories / calories) > 0.35:
                is_safe = False
                exclusion_reasons.append("Thyroid Disorder: Fats exceed 35% of total calories")

        # G. PCOS (Polycystic Ovary Syndrome)
        # Rule: Stabilize insulin resistance. Carbs-to-Protein ratio must be <= 2.0.
        if "pcos" in user_condition_set:
            if protein > 0 and (carbs / protein) > 2.0:
                is_safe = False
                exclusion_reasons.append(f"PCOS: Carb-to-Protein ratio is {round(carbs/protein, 1)} (must be <= 2.0 to control insulin)")

        # -----------------------------------------------------------------
        # 3. SORT PRODUCT
        # -----------------------------------------------------------------
        if is_safe:
            safe_products.append(product)
        else:
            excluded_products.append({
                "product": product,
                "reason": f"Medical Exclusion: {'; '.join(exclusion_reasons)}"
            })

    return safe_products, excluded_products
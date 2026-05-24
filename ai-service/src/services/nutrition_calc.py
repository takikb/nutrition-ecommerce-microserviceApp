"""Clinically adjusted nutrition macro calculations."""

from __future__ import annotations

def calculate_target_macros(
    tdee: float, 
    goal: str, 
    gender: str, 
    medical_conditions: list[str] = []
) -> dict:
    """
    Calculate target calories and dynamically adjusts protein/carb/fat splits
    based on the user's specific medical profiles.
    """

    # 1. Calculate Target Calories based on Goal
    goal_adjustments = {
        "weight_loss": -500.0,
        "muscle_gain": 300.0,
        "maintenance": 0.0,
    }

    adjusted_calories = tdee + goal_adjustments.get(goal, 0.0)

    # Enforce physiological minimum calories by gender
    gender_key = gender.strip().lower()
    if gender_key in ["male", "men"]:
        adjusted_calories = max(adjusted_calories, 1500.0)
    elif gender_key in ["female", "women"]:
        adjusted_calories = max(adjusted_calories, 1200.0)

    # 2. DEFAULT MACRO SPLITS (Protein 30%, Carbs 35%, Fats 35%)
    p_ratio, c_ratio, f_ratio = 0.30, 0.35, 0.35

    # Standardize conditions to lowercase
    conditions = {c.lower().strip() for c in medical_conditions if c.lower() != 'none'}

    # 3. DYNAMIC METABOLIC ADJUSTMENTS
    has_diabetes_or_pcos = any(cond in conditions for cond in ["diabetes_type_1", "diabetes_type_2", "pcos"])
    has_cholesterol_or_bp = any(cond in conditions for cond in ["high_cholesterol", "hypertension"])

    # Overlap Case: User has BOTH Diabetes/PCOS and High Cholesterol/Hypertension
    if has_diabetes_or_pcos and has_cholesterol_or_bp:
        p_ratio, c_ratio, f_ratio = 0.35, 0.35, 0.30 # Balanced heart-healthy diabetic split
        
    # Diabetes / PCOS only: Low-carb, high-protein, healthy-fat
    elif has_diabetes_or_pcos:
        p_ratio, c_ratio, f_ratio = 0.35, 0.25, 0.40
        
    # Cholesterol / Hypertension only: Low-fat, moderate-carb, high-protein
    elif has_cholesterol_or_bp:
        p_ratio, c_ratio, f_ratio = 0.35, 0.45, 0.20
        
    # IBS only: Lower fat to avoid colon spasms
    elif "ibs" in conditions:
        p_ratio, c_ratio, f_ratio = 0.30, 0.45, 0.25

    # 4. Convert Ratios to Grams
    protein_g = (adjusted_calories * p_ratio) / 4.0
    carbs_g = (adjusted_calories * c_ratio) / 4.0
    fats_g = (adjusted_calories * f_ratio) / 9.0

    return {
        "target_calories": round(adjusted_calories, 1),
        "target_protein": round(protein_g, 1),
        "target_carbs": round(carbs_g, 1),
        "target_fats": round(fats_g, 1),
    }
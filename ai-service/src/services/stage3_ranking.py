"""Rank products by similarity to user macro targets."""

from __future__ import annotations

import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import MinMaxScaler

# Global static physiological bounds (to ensure consistent scaling across all queries)
# Bounds: [Calories, Protein, Carbs, Fats]
MIN_BOUNDS = np.array([0.0, 0.0, 0.0, 0.0], dtype=float)
MAX_BOUNDS = np.array([3000.0, 250.0, 500.0, 150.0], dtype=float)

def _get_value(item: object, key: str) -> float:
    """Read a numeric value from a dict or an object attribute."""

    if isinstance(item, dict):
        if key not in item:
            raise KeyError(f"Product missing key: {key}")
        return float(item[key])

    if not hasattr(item, key):
        raise AttributeError(f"Product missing attribute: {key}")
    return float(getattr(item, key))


def _set_value(item: object, key: str, value: float) -> None:
    """Set a numeric value on a dict or an object attribute."""
    if isinstance(item, dict):
        item[key] = value
    else:
        setattr(item, key, value)


def rank_products(user_macros: dict, products: list) -> list:
    """Ranks products via global cosine similarity and calculates required portions."""
    if not products:
        return []

    product_keys = ["calories", "protein_g", "carbs_g", "fats_g"]
    user_keys = ["target_calories", "target_protein", "target_carbs", "target_fats"]

    # Parse and scale user vector globally
    user_vector = np.array([float(user_macros[key]) for key in user_keys], dtype=float)
    user_scaled = (user_vector - MIN_BOUNDS) / (MAX_BOUNDS - MIN_BOUNDS)
    user_scaled = np.clip(user_scaled, 0.0, 1.0).reshape(1, -1)

    # Calculate target calories per meal assuming a 3-meal daily schedule
    target_meal_calories = float(user_macros["target_calories"]) / 3.0

    scored_products = []
    for product in products:
        prod_vector = np.array([_get_value(product, key) for key in product_keys], dtype=float)
        
        # Scale product vector globally
        prod_scaled = (prod_vector - MIN_BOUNDS) / (MAX_BOUNDS - MIN_BOUNDS)
        prod_scaled = np.clip(prod_scaled, 0.0, 1.0).reshape(1, -1)

        # Compute cosine similarity against global scale
        score = float(cosine_similarity(prod_scaled, user_scaled)[0][0])
        _set_value(product, "match_score", score)

        # Calculate recommended portions to hit 1/3 of daily calorie targets
        prod_calories = _get_value(product, "calories")
        portions = 1.0
        if prod_calories > 0:
            portions = target_meal_calories / prod_calories
        
        _set_value(product, "recommended_portions", round(portions, 2))
        scored_products.append(product)

    # Sort products by match score descending
    scored_products.sort(key=lambda x: _get_value(x, "match_score"), reverse=True)
    return scored_products
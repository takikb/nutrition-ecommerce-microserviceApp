"""Cluster prediction helpers for live inference."""

from __future__ import annotations

from pathlib import Path

import joblib
import numpy as np

_MODEL = None


def load_model():
    """Load and cache the trained KMeans pipeline."""

    global _MODEL
    if _MODEL is not None:
        return _MODEL

    repo_root = Path(__file__).resolve().parents[2]
    model_path = repo_root / "ml_pipeline" / "models" / "kmeans_model.pkl"

    if not model_path.exists():
        raise FileNotFoundError(f"KMeans model not found at: {model_path}")

    _MODEL = joblib.load(model_path)
    return _MODEL


def predict_cluster(target_macros: dict) -> int:
    """Predict a cluster id from target macro values."""

    required_keys = [
        "target_calories",
        "target_protein",
        "target_carbs",
        "target_fats",
    ]

    missing = [key for key in required_keys if key not in target_macros]
    if missing:
        raise KeyError(f"Missing macro keys: {', '.join(missing)}")

    vector = np.array(
        [
            float(target_macros["target_calories"]),
            float(target_macros["target_protein"]),
            float(target_macros["target_carbs"]),
            float(target_macros["target_fats"]),
        ],
        dtype=float,
    ).reshape(1, -1)

    model = load_model()
    cluster_id = model.predict(vector)[0]
    return int(cluster_id)

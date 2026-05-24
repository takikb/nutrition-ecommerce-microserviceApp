"""Train a KMeans model on synthetic nutrition data."""

from __future__ import annotations

from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import MinMaxScaler


def generate_synthetic_data(n_rows: int = 5000, seed: int = 42) -> pd.DataFrame:
    """Generate a realistic synthetic dataset of food macros."""

    rng = np.random.default_rng(seed)

    protein_g = rng.uniform(0.0, 50.0, n_rows)
    carbs_g = rng.uniform(0.0, 100.0, n_rows)
    fats_g = rng.uniform(0.0, 40.0, n_rows)

    base_calories = (protein_g * 4.0) + (carbs_g * 4.0) + (fats_g * 9.0)
    noise_factor = rng.uniform(0.95, 1.05, n_rows)
    calories = base_calories * noise_factor

    return pd.DataFrame(
        {
            "calories": calories,
            "protein_g": protein_g,
            "carbs_g": carbs_g,
            "fats_g": fats_g,
        }
    )


def build_pipeline() -> Pipeline:
    """Create the preprocessing and clustering pipeline."""

    return Pipeline(
        steps=[
            ("scaler", MinMaxScaler()),
            (
                "kmeans",
                KMeans(n_clusters=8, random_state=42, n_init="auto"),
            ),
        ]
    )


def print_cluster_profiles(pipeline: Pipeline, feature_cols: list[str]) -> None:
    """Print denormalized cluster centers for interpretability."""

    scaler: MinMaxScaler = pipeline.named_steps["scaler"]
    kmeans: KMeans = pipeline.named_steps["kmeans"]

    centers_scaled = kmeans.cluster_centers_
    centers = scaler.inverse_transform(centers_scaled)

    centers_df = pd.DataFrame(centers, columns=feature_cols)
    centers_df.index.name = "cluster"

    print("Cluster centers (approximate macro profiles):")
    print(centers_df.round(1).to_string())


def save_pipeline(pipeline: Pipeline) -> Path:
    """Persist the trained pipeline to the models directory."""

    models_dir = Path(__file__).resolve().parent / "models"
    models_dir.mkdir(parents=True, exist_ok=True)

    model_path = models_dir / "kmeans_model.pkl"
    joblib.dump(pipeline, model_path)
    return model_path


def main() -> None:
    feature_cols = ["calories", "protein_g", "carbs_g", "fats_g"]

    data = generate_synthetic_data()
    pipeline = build_pipeline()

    pipeline.fit(data[feature_cols])
    print_cluster_profiles(pipeline, feature_cols)

    model_path = save_pipeline(pipeline)
    print(f"Saved model to: {model_path}")


if __name__ == "__main__":
    main()

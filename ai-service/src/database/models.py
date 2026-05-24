"""Read-model tables for local replicas (SQLAlchemy 2.0)."""

from __future__ import annotations

from sqlalchemy import Float, Integer, String, Boolean, JSON
from sqlalchemy.orm import Mapped, mapped_column

from .database import Base


class LocalHealthProfile(Base):
    """Flattened user projection from the Auth service."""

    __tablename__ = "local_health_profiles"

    # We use the Auth Service's User ID as the Primary Key
    user_id: Mapped[str] = mapped_column(String, primary_key=True)
    gender: Mapped[str] = mapped_column(String)
    
    # We store the TDEE calculated by Node.js
    tdee: Mapped[float] = mapped_column(Float)
    primary_health_goal: Mapped[str] = mapped_column(String)
    
    # We use JSON to store your TS Enums: e.g., ["diabetes_type_1"]
    medical_conditions: Mapped[list[str]] = mapped_column(JSON, default=list)
    allergies: Mapped[list[str]] = mapped_column(JSON, default=list)


class LocalProduct(Base):
    """Flattened product projection from the Products service."""

    __tablename__ = "local_products"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    title: Mapped[str] = mapped_column(String)
    price_dzd: Mapped[float] = mapped_column(Float)
    
    # Nutrition Macros
    calories: Mapped[float] = mapped_column(Float)
    protein_g: Mapped[float] = mapped_column(Float)
    carbs_g: Mapped[float] = mapped_column(Float)
    fats_g: Mapped[float] = mapped_column(Float)
    
    # Safety Data (Stored as JSON Arrays)
    contains_allergens: Mapped[list[str]] = mapped_column(JSON, default=list)
    medical_conditions: Mapped[list[str]] = mapped_column(JSON, default=list)
    
    # Status tracking
    is_available: Mapped[bool] = mapped_column(Boolean, default=True)
    
    # The AI Cluster ID (Calculated on NATS ingestion)
    cluster_id: Mapped[int | None] = mapped_column(Integer, nullable=True)
"""Database setup and session management."""

from __future__ import annotations

from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

# Keep it simple: Save the SQLite database file in the root folder of the project
SQLALCHEMY_DATABASE_URL = "sqlite:///./ai_replica.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
)

SessionLocal = sessionmaker(bind=engine, class_=Session, autoflush=False, autocommit=False)


class Base(DeclarativeBase):
    """Base class for declarative models."""


# Dependency for FastAPI routes.
def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
"""
BudgetIQ – Database Connection & Session Management
Supports both SQLite (local dev) and PostgreSQL (Supabase production).
"""
import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker
from config import DATABASE_URL

logger = logging.getLogger(__name__)

# Detect database type and configure engine accordingly
_is_sqlite = DATABASE_URL.startswith("sqlite")

if _is_sqlite:
    # SQLite – local development
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False}
    )
    logger.info("Using SQLite database (local development)")
else:
    # PostgreSQL (Supabase) – production
    # Ensure SSL is enabled for Supabase connections
    db_url = DATABASE_URL
    if "sslmode" not in db_url:
        separator = "&" if "?" in db_url else "?"
        db_url = f"{db_url}{separator}sslmode=require"

    engine = create_engine(
        db_url,
        pool_size=5,
        max_overflow=10,
        pool_pre_ping=True,
        pool_recycle=300,
    )
    logger.info(f"Using PostgreSQL database (production)")

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# Base class for all models (modern SQLAlchemy 2.0+ pattern)
class Base(DeclarativeBase):
    pass


# Expose db type for query compatibility
IS_SQLITE = _is_sqlite


def get_db():
    """Dependency that provides a database session per request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

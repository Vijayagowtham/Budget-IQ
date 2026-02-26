"""
BudgetIQ – Database Connection & Session Management
Supports both SQLite (local dev) and PostgreSQL (Supabase production).
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker
from config import DATABASE_URL

# Detect database type and configure engine accordingly
_is_sqlite = DATABASE_URL.startswith("sqlite")

if _is_sqlite:
    # SQLite – local development
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False}
    )
else:
    # PostgreSQL (Supabase) – production
    engine = create_engine(
        DATABASE_URL,
        pool_size=5,
        max_overflow=10,
        pool_pre_ping=True,
        pool_recycle=300,
    )

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

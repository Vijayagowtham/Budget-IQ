"""
BudgetIQ – Main Application Entry Point
FastAPI server with CORS, rate limiting, static file serving, and all route registrations.
"""
import os
import logging
from dotenv import load_dotenv

# Load .env file if present (for local development)
load_dotenv()

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from database import engine, Base
from config import FRONTEND_URL, UPLOAD_DIR

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

from rate_limiter import limiter, HAS_SLOWAPI

# Import all route modules
from routes.auth_routes import router as auth_router
from routes.income_routes import router as income_router
from routes.expense_routes import router as expense_router
from routes.dashboard_routes import router as dashboard_router
from routes.ai_routes import router as ai_router
from routes.notification_routes import router as notification_router
from routes.profile_routes import router as profile_router
from routes.report_routes import router as report_router

# Create all database tables (safe for production - uses IF NOT EXISTS)
try:
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created/verified successfully.")
except Exception as e:
    logger.warning(f"create_all skipped (tables may already exist): {e}")

# Initialize FastAPI app
app = FastAPI(
    title="BudgetIQ API",
    description="AI-Based Personal Budget Management System",
    version="1.0.0"
)

# Attach rate limiter to app
if HAS_SLOWAPI:
    from slowapi import _rate_limit_exceeded_handler
    from slowapi.errors import RateLimitExceeded
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS middleware – allow ALL origins for maximum compatibility
# The backend uses JWT tokens for security, not CORS restrictions.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
logger.info(f"CORS: allowing all origins. FRONTEND_URL={FRONTEND_URL}")

# Serve uploaded profile pictures
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Register all routers
app.include_router(auth_router)
app.include_router(income_router)
app.include_router(expense_router)
app.include_router(dashboard_router)
app.include_router(ai_router)
app.include_router(notification_router)
app.include_router(profile_router)
app.include_router(report_router)


@app.get("/")
def root():
    """Health check endpoint."""
    return {"status": "ok", "app": "BudgetIQ API", "version": "1.0.0"}


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    print(f"\n[BudgetIQ] API Server starting...")
    print(f"  > http://localhost:{port}")
    print(f"  > Docs: http://localhost:{port}/docs\n")
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)

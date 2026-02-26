"""
BudgetIQ – Main Application Entry Point
FastAPI server with CORS, rate limiting, static file serving, and all route registrations.
"""
import os
from dotenv import load_dotenv

# Load .env file if present (for local development)
load_dotenv()

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from database import engine, Base
from config import FRONTEND_URL, UPLOAD_DIR

# Rate limiter setup
try:
    from slowapi import Limiter, _rate_limit_exceeded_handler
    from slowapi.util import get_remote_address
    from slowapi.errors import RateLimitExceeded
    limiter = Limiter(key_func=get_remote_address)
    _HAS_SLOWAPI = True
except ImportError:
    limiter = None
    _HAS_SLOWAPI = False

# Import all route modules
from routes.auth_routes import router as auth_router
from routes.income_routes import router as income_router
from routes.expense_routes import router as expense_router
from routes.dashboard_routes import router as dashboard_router
from routes.ai_routes import router as ai_router
from routes.notification_routes import router as notification_router
from routes.profile_routes import router as profile_router
from routes.report_routes import router as report_router

# Create all database tables
Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(
    title="BudgetIQ API",
    description="AI-Based Personal Budget Management System",
    version="1.0.0"
)

# Attach rate limiter to app
if _HAS_SLOWAPI:
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS middleware – allow frontend origins (dev + production)
allowed_origins = [
    FRONTEND_URL,
    "http://localhost:5173",
    "http://localhost:3000",
]
# Filter out empty strings and duplicates
allowed_origins = list(set(o for o in allowed_origins if o))

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

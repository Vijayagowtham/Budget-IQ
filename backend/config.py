"""
BudgetIQ – Application Configuration
All sensitive values are loaded from environment variables.
"""
import os

# JWT Settings
SECRET_KEY = os.getenv("BUDGETIQ_SECRET_KEY", "budgetiq-super-secret-key-change-in-production-2024")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

# Database – Supabase PostgreSQL (falls back to SQLite for local dev)
DATABASE_URL = os.getenv(
    "SUPABASE_DB_URL",
    os.getenv("DATABASE_URL", "sqlite:///./budgetiq.db")
)

# Upload directory for profile pictures
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Frontend URL (for CORS and email verification links)
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")

# Google Gemini API key (get free key at https://aistudio.google.com/apikey)
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

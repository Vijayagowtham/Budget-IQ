"""
BudgetIQ – Application Configuration
All sensitive values are loaded from environment variables.
"""
import os

# Detect production mode (Supabase DB URL set = production)
_IS_PRODUCTION = bool(os.getenv("SUPABASE_DB_URL"))

# JWT Settings – fail loudly in production if secret key is not set
_default_secret = "budgetiq-super-secret-key-change-in-production-2024"
SECRET_KEY = os.getenv("BUDGETIQ_SECRET_KEY", _default_secret)
if _IS_PRODUCTION and SECRET_KEY == _default_secret:
    raise RuntimeError(
        "CRITICAL: BUDGETIQ_SECRET_KEY environment variable must be set in production! "
        "Generate one with: python -c \"import secrets; print(secrets.token_urlsafe(64))\""
    )
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

# Max avatar file size (5 MB)
MAX_AVATAR_SIZE = 5 * 1024 * 1024

# Frontend URL (for CORS and email verification links)
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

# Backend URL – auto-detect from RENDER_EXTERNAL_URL if available
BACKEND_URL = os.getenv(
    "BACKEND_URL",
    os.getenv("RENDER_EXTERNAL_URL", "http://localhost:8000")
)

# Google Gemini API key (get free key at https://aistudio.google.com/apikey)
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

# SMTP Email Settings (for verification emails)
# Falls back to console print if not configured
SMTP_HOST = os.getenv("SMTP_HOST", "")          # e.g. smtp.gmail.com
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))   # 587 for TLS
SMTP_USER = os.getenv("SMTP_USER", "")           # e.g. your@gmail.com
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")   # Gmail App Password
SMTP_FROM = os.getenv("SMTP_FROM", "")           # Sender display email

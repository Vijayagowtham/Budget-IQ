"""
BudgetIQ – Auth Routes (Signup, Login, Email Verification, Forgot Password)
"""
import logging
from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from database import get_db
from models import User
from auth import hash_password, verify_password, create_access_token, create_verification_token, decode_token
from schemas import SignupRequest, LoginRequest, ForgotPasswordRequest, TokenResponse, MessageResponse, UserResponse
from config import BACKEND_URL, FRONTEND_URL
from email_utils import send_verification_email, send_password_reset_email

router = APIRouter(prefix="/api/auth", tags=["Authentication"])
logger = logging.getLogger(__name__)

# Rate limiter (standalone module to avoid circular imports)
from rate_limiter import limiter


@router.post("/signup", response_model=MessageResponse)
def signup(request: Request, req: SignupRequest, db: Session = Depends(get_db)):
    """Register a new user and send email verification link."""
    try:
        existing = db.query(User).filter(User.email == req.email).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")

        user = User(
            name=req.name,
            email=req.email,
            hashed_password=hash_password(req.password),
            is_verified=False
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        # Generate verification token and send email
        token = create_verification_token(req.email)
        verify_url = f"{BACKEND_URL}/api/auth/verify-email?token={token}"
        send_verification_email(req.email, verify_url)

        return {
            "message": "Account created! A verification link has been sent to your email. Please check your email (or the server console) for the verification link."
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Signup error for {req.email}: {e}", exc_info=True)
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Signup error: {str(e)}")


@router.get("/verify-email")
def verify_email(token: str, db: Session = Depends(get_db)):
    """Verify user email and redirect to frontend login with status."""
    try:
        payload = decode_token(token)
        if payload.get("purpose") != "email_verify":
            return RedirectResponse(
                url=f"{FRONTEND_URL}/login?verified=error&message=Invalid+verification+token",
                status_code=302
            )

        email = payload.get("sub")
        user = db.query(User).filter(User.email == email).first()
        if not user:
            return RedirectResponse(
                url=f"{FRONTEND_URL}/login?verified=error&message=User+not+found",
                status_code=302
            )

        if user.is_verified:
            return RedirectResponse(
                url=f"{FRONTEND_URL}/login?verified=already&message=Email+already+verified",
                status_code=302
            )

        user.is_verified = True
        db.commit()

        return RedirectResponse(
            url=f"{FRONTEND_URL}/login?verified=success&message=Email+verified+successfully",
            status_code=302
        )

    except Exception:
        return RedirectResponse(
            url=f"{FRONTEND_URL}/login?verified=error&message=Invalid+or+expired+verification+link",
            status_code=302
        )


@router.post("/login", response_model=TokenResponse)
def login(request: Request, req: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate user and return JWT access token."""
    try:
        user = db.query(User).filter(User.email == req.email).first()
        if not user or not verify_password(req.password, user.hashed_password):
            raise HTTPException(status_code=401, detail="Invalid email or password")

        if not user.is_verified:
            raise HTTPException(
                status_code=403,
                detail="Please verify your email before logging in. Check your email for the verification link."
            )

        access_token = create_access_token(data={"sub": user.email})
        return TokenResponse(
            access_token=access_token,
            user=UserResponse.model_validate(user)
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error for {req.email}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Login error: {str(e)}")


@router.post("/forgot-password", response_model=MessageResponse)
def forgot_password(request: Request, req: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """Send a password reset link via email."""
    user = db.query(User).filter(User.email == req.email).first()
    if not user:
        return {"message": "If this email is registered, a password reset link has been sent."}

    token = create_access_token(data={"sub": user.email, "purpose": "password_reset"})
    reset_url = f"{BACKEND_URL}/api/auth/reset-password?token={token}"
    send_password_reset_email(req.email, reset_url)

    return {"message": "If this email is registered, a password reset link has been sent (check your email or server console)."}


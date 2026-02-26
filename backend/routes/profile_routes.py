"""
BudgetIQ – Profile Routes (View, Edit, Avatar Upload)
"""
import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from database import get_db
from models import User
from auth import get_current_user
from schemas import UserResponse, ProfileUpdateRequest
from config import UPLOAD_DIR, MAX_AVATAR_SIZE

router = APIRouter(prefix="/api/profile", tags=["Profile"])

# Allowed avatar file extensions
ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "gif", "webp"}


@router.get("", response_model=UserResponse)
def get_profile(user: User = Depends(get_current_user)):
    """Get the authenticated user's profile."""
    return user


@router.put("", response_model=UserResponse)
def update_profile(
    req: ProfileUpdateRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Update profile name and/or email."""
    if req.name is not None and req.name.strip():
        user.name = req.name.strip()
    if req.email is not None and req.email.strip() and req.email != user.email:
        # Check if new email is already taken
        existing = db.query(User).filter(User.email == req.email).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already in use")
        user.email = req.email
    db.commit()
    db.refresh(user)
    return user


@router.post("/avatar", response_model=UserResponse)
async def upload_avatar(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Upload or change profile picture."""
    # Validate file type
    allowed_types = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Only JPEG, PNG, GIF, or WebP images are allowed")

    # Validate extension against whitelist
    ext = (file.filename.rsplit(".", 1)[-1].lower()) if file.filename and "." in file.filename else ""
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"Invalid file extension '.{ext}'. Allowed: {', '.join(ALLOWED_EXTENSIONS)}")

    # Read content and enforce size limit
    content = await file.read()
    if len(content) > MAX_AVATAR_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File too large ({len(content) / 1024 / 1024:.1f}MB). Maximum size is {MAX_AVATAR_SIZE / 1024 / 1024:.0f}MB."
        )

    # Generate unique filename
    filename = f"{user.id}_{uuid.uuid4().hex[:8]}.{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)

    # Remove old avatar if exists
    if user.avatar_path:
        old_path = os.path.join(UPLOAD_DIR, user.avatar_path)
        if os.path.exists(old_path):
            os.remove(old_path)

    # Save new avatar
    with open(filepath, "wb") as f:
        f.write(content)

    user.avatar_path = filename
    db.commit()
    db.refresh(user)
    return user

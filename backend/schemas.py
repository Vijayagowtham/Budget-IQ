"""
BudgetIQ – Pydantic Schemas for request/response validation
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime


# ─── Auth Schemas ────────────────────────────────────────

class SignupRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: str = Field(..., min_length=5, max_length=255)
    password: str = Field(..., min_length=6, max_length=128)

class LoginRequest(BaseModel):
    email: str
    password: str

class ForgotPasswordRequest(BaseModel):
    email: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserResponse"

class MessageResponse(BaseModel):
    message: str


# ─── User / Profile Schemas ─────────────────────────────

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    is_verified: bool
    avatar_path: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class ProfileUpdateRequest(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None


# ─── Income Schemas ─────────────────────────────────────

class IncomeCreate(BaseModel):
    amount: float = Field(..., gt=0)
    source: str = Field(..., min_length=1, max_length=200)
    date: datetime

class IncomeResponse(BaseModel):
    id: int
    amount: float
    source: str
    date: datetime
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Expense Schemas ────────────────────────────────────

class ExpenseCreate(BaseModel):
    amount: float = Field(..., gt=0)
    category: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    date: datetime

class ExpenseResponse(BaseModel):
    id: int
    amount: float
    category: str
    description: Optional[str] = None
    date: datetime
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Dashboard Schemas ──────────────────────────────────

class DashboardSummary(BaseModel):
    total_income: float
    total_expense: float
    current_balance: float
    income_count: int
    expense_count: int

class ChartDataPoint(BaseModel):
    label: str
    income: float
    expense: float


# ─── AI / Chat Schemas ──────────────────────────────────

class AiInsight(BaseModel):
    type: str  # tip, warning, alert, info
    message: str
    icon: Optional[str] = None

class ChatMessage(BaseModel):
    message: str

class ChatResponse(BaseModel):
    reply: str
    insights: Optional[List[AiInsight]] = None


# ─── Notification Schemas ───────────────────────────────

class NotificationResponse(BaseModel):
    id: int
    message: str
    type: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

"""
BudgetIQ – AI Insights & Chatbot Routes
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import User
from auth import get_current_user
from schemas import AiInsight, ChatMessage, ChatResponse
from ai_engine import generate_insights, chat_response
from typing import List

router = APIRouter(prefix="/api/ai", tags=["AI Insights"])


@router.get("/insights", response_model=List[AiInsight])
def get_insights(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """Get AI-generated insights based on user's real financial data."""
    raw_insights = generate_insights(db, user.id)
    return [AiInsight(**i) for i in raw_insights]


@router.post("/chat", response_model=ChatResponse)
def chat(
    msg: ChatMessage,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Chat with the AI assistant about your finances."""
    reply = chat_response(db, user.id, msg.message)
    return ChatResponse(reply=reply)

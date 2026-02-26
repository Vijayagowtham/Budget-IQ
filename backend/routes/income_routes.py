"""
BudgetIQ – Income Routes
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import Income, User
from auth import get_current_user
from schemas import IncomeCreate, IncomeResponse

router = APIRouter(prefix="/api/income", tags=["Income"])


@router.get("", response_model=List[IncomeResponse])
def get_incomes(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """Get all income entries for the authenticated user."""
    return db.query(Income).filter(Income.user_id == user.id).order_by(Income.date.desc()).all()


@router.post("", response_model=IncomeResponse)
def add_income(req: IncomeCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """Add a new income entry."""
    income = Income(
        user_id=user.id,
        amount=req.amount,
        source=req.source,
        date=req.date
    )
    db.add(income)
    db.commit()
    db.refresh(income)
    return income


@router.delete("/{income_id}")
def delete_income(income_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """Delete an income entry by ID."""
    income = db.query(Income).filter(Income.id == income_id, Income.user_id == user.id).first()
    if not income:
        raise HTTPException(status_code=404, detail="Income entry not found")
    db.delete(income)
    db.commit()
    return {"message": "Income entry deleted successfully"}

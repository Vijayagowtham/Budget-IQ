"""
BudgetIQ – Expense Routes
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import Expense, User
from auth import get_current_user
from schemas import ExpenseCreate, ExpenseResponse

router = APIRouter(prefix="/api/expenses", tags=["Expenses"])


@router.get("", response_model=List[ExpenseResponse])
def get_expenses(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db), 
    user: User = Depends(get_current_user)
):
    """Get all expense entries for the authenticated user."""
    return db.query(Expense).filter(Expense.user_id == user.id).order_by(Expense.date.desc()).offset(skip).limit(limit).all()


@router.post("", response_model=ExpenseResponse)
def add_expense(req: ExpenseCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """Add a new expense entry."""
    expense = Expense(
        user_id=user.id,
        amount=req.amount,
        category=req.category,
        description=req.description,
        date=req.date
    )
    db.add(expense)
    db.commit()
    db.refresh(expense)
    return expense


@router.delete("/{expense_id}")
def delete_expense(expense_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """Delete an expense entry by ID."""
    expense = db.query(Expense).filter(Expense.id == expense_id, Expense.user_id == user.id).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense entry not found")
    db.delete(expense)
    db.commit()
    return {"message": "Expense entry deleted successfully"}

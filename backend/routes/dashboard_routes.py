"""
BudgetIQ – Dashboard Routes (Summary & Chart Data)
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from datetime import datetime, timedelta
from database import get_db
from models import Income, Expense, User
from auth import get_current_user
from schemas import DashboardSummary, ChartDataPoint
from typing import List

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("/summary", response_model=DashboardSummary)
def get_summary(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """Get total income, total expenses, and current balance."""
    total_income = db.query(func.coalesce(func.sum(Income.amount), 0)).filter(
        Income.user_id == user.id
    ).scalar()
    total_expense = db.query(func.coalesce(func.sum(Expense.amount), 0)).filter(
        Expense.user_id == user.id
    ).scalar()
    income_count = db.query(func.count(Income.id)).filter(Income.user_id == user.id).scalar()
    expense_count = db.query(func.count(Expense.id)).filter(Expense.user_id == user.id).scalar()

    return DashboardSummary(
        total_income=float(total_income),
        total_expense=float(total_expense),
        current_balance=float(total_income) - float(total_expense),
        income_count=income_count,
        expense_count=expense_count
    )


@router.get("/chart-data", response_model=List[ChartDataPoint])
def get_chart_data(
    period: str = Query("monthly", regex="^(weekly|monthly)$"),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Get time-series income vs expense data for charts."""
    now = datetime.utcnow()
    data_points = []

    if period == "monthly":
        # Last 6 months
        for i in range(5, -1, -1):
            month_start = (now.replace(day=1) - timedelta(days=i * 30)).replace(day=1)
            if month_start.month == 12:
                month_end = month_start.replace(year=month_start.year + 1, month=1, day=1)
            else:
                month_end = month_start.replace(month=month_start.month + 1, day=1)

            income = db.query(func.coalesce(func.sum(Income.amount), 0)).filter(
                Income.user_id == user.id,
                Income.date >= month_start,
                Income.date < month_end
            ).scalar()

            expense = db.query(func.coalesce(func.sum(Expense.amount), 0)).filter(
                Expense.user_id == user.id,
                Expense.date >= month_start,
                Expense.date < month_end
            ).scalar()

            label = month_start.strftime("%b %Y")
            data_points.append(ChartDataPoint(
                label=label, income=float(income), expense=float(expense)
            ))
    else:
        # Last 8 weeks
        for i in range(7, -1, -1):
            week_start = now - timedelta(weeks=i, days=now.weekday())
            week_start = week_start.replace(hour=0, minute=0, second=0, microsecond=0)
            week_end = week_start + timedelta(days=7)

            income = db.query(func.coalesce(func.sum(Income.amount), 0)).filter(
                Income.user_id == user.id,
                Income.date >= week_start,
                Income.date < week_end
            ).scalar()

            expense = db.query(func.coalesce(func.sum(Expense.amount), 0)).filter(
                Expense.user_id == user.id,
                Expense.date >= week_start,
                Expense.date < week_end
            ).scalar()

            label = f"Week {week_start.strftime('%d/%m')}"
            data_points.append(ChartDataPoint(
                label=label, income=float(income), expense=float(expense)
            ))

    return data_points

"""
BudgetIQ - AI Insights Engine
Powered by Google Gemini LLM with real user financial data context.
Falls back to rule-based analysis if no API key is configured.
"""
import logging
from sqlalchemy.orm import Session
from sqlalchemy import func, cast, Date
from datetime import datetime, timedelta, timezone
from models import Income, Expense
from typing import List, Dict, Optional
from config import GEMINI_API_KEY

logger = logging.getLogger(__name__)

# ─── Gemini LLM Setup ────────────────────────────────────
_gemini_model = None

def _get_gemini_model():
    """Lazy-initialize and return the Gemini generative model."""
    global _gemini_model
    if _gemini_model is not None:
        return _gemini_model
    if not GEMINI_API_KEY:
        logger.info("No GEMINI_API_KEY set. AI chat will use rule-based fallback.")
        return None
    try:
        import google.generativeai as genai
        genai.configure(api_key=GEMINI_API_KEY)
        _gemini_model = genai.GenerativeModel(
            model_name="gemini-2.0-flash",
            system_instruction=_build_system_prompt(),
        )
        logger.info("Gemini LLM model initialized successfully.")
        return _gemini_model
    except Exception as e:
        logger.error(f"Failed to initialize Gemini: {e}")
        return None


SYSTEM_PROMPT = """You are BudgetIQ AI, a professional personal finance assistant embedded inside the BudgetIQ budget management application.

ROLE & EXPERTISE:
- You are an expert in personal finance, budgeting, saving strategies, expense management, income planning, and financial literacy.
- You analyze the user's REAL financial data (provided below in the context) and give personalized, actionable advice.
- You speak in a warm, professional, and encouraging tone.

STRICT RULES:
1. ONLY answer questions related to personal finance, budgeting, saving, investing basics, expenses, income, debt management, or financial planning.
2. If the user asks about anything OUTSIDE finance/budgeting (e.g., coding, recipes, politics, weather, entertainment, etc.), respond EXACTLY with:
   "I'm your BudgetIQ financial assistant. I can only help with finance and budgeting topics. Please ask me about your budget, savings, expenses, or financial planning!"
3. NEVER make up financial data. Only reference numbers from the user data context provided below.
4. Keep responses concise (under 200 words) and well-formatted.
5. Use plain text formatting. Use line breaks for readability but no markdown.
6. When giving advice, be specific and actionable based on the user's actual numbers.
7. If the user has no data yet, encourage them to start adding income and expenses.
8. Always be encouraging and supportive about financial progress."""


def _build_system_prompt():
    """Build the static system prompt for Gemini."""
    return SYSTEM_PROMPT


# ─── Data Helpers ─────────────────────────────────────────

def get_category_breakdown(db: Session, user_id: int, days: int = 30) -> Dict[str, float]:
    """Get expense breakdown by category for the last N days."""
    since = datetime.now(timezone.utc) - timedelta(days=days)
    results = db.query(
        Expense.category,
        func.sum(Expense.amount).label("total")
    ).filter(
        Expense.user_id == user_id,
        Expense.date >= since
    ).group_by(Expense.category).all()
    return {row.category: float(row.total) for row in results}


def get_monthly_totals(db: Session, user_id: int, months_ago: int = 0):
    """Get income and expense totals for a specific month.
    Uses date-range filtering compatible with both SQLite and PostgreSQL.
    """
    now = datetime.now(timezone.utc)
    target_month = now.month - months_ago
    target_year = now.year
    while target_month <= 0:
        target_month += 12
        target_year -= 1

    # Build month start/end for range filter (works on both SQLite and PostgreSQL)
    month_start = datetime(target_year, target_month, 1)
    if target_month == 12:
        month_end = datetime(target_year + 1, 1, 1)
    else:
        month_end = datetime(target_year, target_month + 1, 1)

    income = db.query(func.coalesce(func.sum(Income.amount), 0)).filter(
        Income.user_id == user_id,
        Income.date >= month_start,
        Income.date < month_end
    ).scalar()

    expense = db.query(func.coalesce(func.sum(Expense.amount), 0)).filter(
        Expense.user_id == user_id,
        Expense.date >= month_start,
        Expense.date < month_end
    ).scalar()

    return float(income), float(expense)


def get_recent_transactions(db: Session, user_id: int, limit: int = 10) -> str:
    """Get recent transactions as a formatted string for LLM context."""
    lines = []

    recent_incomes = db.query(Income).filter(
        Income.user_id == user_id
    ).order_by(Income.date.desc()).limit(limit).all()

    recent_expenses = db.query(Expense).filter(
        Expense.user_id == user_id
    ).order_by(Expense.date.desc()).limit(limit).all()

    if recent_incomes:
        lines.append("Recent Income Entries:")
        for inc in recent_incomes:
            lines.append(f"  - {inc.date.strftime('%d %b %Y')}: {inc.source} = {inc.amount:,.0f}")

    if recent_expenses:
        lines.append("Recent Expense Entries:")
        for exp in recent_expenses:
            desc = f" ({exp.description})" if exp.description else ""
            lines.append(f"  - {exp.date.strftime('%d %b %Y')}: {exp.category}{desc} = {exp.amount:,.0f}")

    return "\n".join(lines) if lines else "No transactions recorded yet."


def build_user_context(db: Session, user_id: int) -> str:
    """Build a comprehensive financial context string for the LLM."""
    current_income, current_expense = get_monthly_totals(db, user_id, 0)
    prev_income, prev_expense = get_monthly_totals(db, user_id, 1)
    balance = current_income - current_expense
    categories = get_category_breakdown(db, user_id, 30)
    total_expense_30d = sum(categories.values()) if categories else 0
    recent = get_recent_transactions(db, user_id, 8)

    context_parts = [
        f"=== USER FINANCIAL DATA (as of {datetime.now(timezone.utc).strftime('%d %b %Y')}) ===",
        f"",
        f"This Month:",
        f"  Total Income: {current_income:,.0f}",
        f"  Total Expenses: {current_expense:,.0f}",
        f"  Current Balance: {balance:,.0f}",
        f"  Savings Rate: {((balance / current_income) * 100):.1f}%" if current_income > 0 else "  Savings Rate: N/A (no income)",
    ]

    if prev_income > 0 or prev_expense > 0:
        context_parts.extend([
            f"",
            f"Last Month:",
            f"  Income: {prev_income:,.0f}",
            f"  Expenses: {prev_expense:,.0f}",
        ])
        if prev_expense > 0 and current_expense > 0:
            change_pct = ((current_expense - prev_expense) / prev_expense) * 100
            context_parts.append(f"  Spending Change: {change_pct:+.1f}% vs last month")

    if categories:
        context_parts.extend([
            f"",
            f"Expense Breakdown (Last 30 Days):",
        ])
        for cat, amt in sorted(categories.items(), key=lambda x: -x[1]):
            pct = (amt / total_expense_30d * 100) if total_expense_30d > 0 else 0
            context_parts.append(f"  {cat}: {amt:,.0f} ({pct:.0f}%)")
        context_parts.append(f"  Total: {total_expense_30d:,.0f}")

    context_parts.extend(["", recent])

    return "\n".join(context_parts)


# ─── Insights (Rule-Based, for dashboard cards) ──────────

def generate_insights(db: Session, user_id: int) -> List[dict]:
    """
    Generate personalized insights based on user's real financial data.
    These appear as cards in the AI Insights panel.
    """
    insights = []

    current_income, current_expense = get_monthly_totals(db, user_id, 0)
    prev_income, prev_expense = get_monthly_totals(db, user_id, 1)
    balance = current_income - current_expense
    categories = get_category_breakdown(db, user_id, 30)
    total_expense_30d = sum(categories.values()) if categories else 0

    # Balance status
    if current_income > 0 and balance > 0:
        savings_rate = (balance / current_income) * 100
        insights.append({
            "type": "info",
            "message": f"Your savings rate this month is {savings_rate:.1f}%. "
                       f"You've saved {balance:,.0f} so far!"
        })
    elif balance < 0:
        insights.append({
            "type": "warning",
            "message": f"Alert: You've overspent by {abs(balance):,.0f} this month. "
                       f"Your expenses exceed your income."
        })

    # Month-over-month comparison
    if prev_expense > 0 and current_expense > 0:
        change = ((current_expense - prev_expense) / prev_expense) * 100
        if change > 10:
            insights.append({
                "type": "warning",
                "message": f"Your spending increased by {change:.1f}% compared to last month. "
                           f"Consider reviewing your expenses."
            })
        elif change < -10:
            insights.append({
                "type": "tip",
                "message": f"Great job! Your spending decreased by {abs(change):.1f}% compared to last month."
            })

    # Top spending category
    if categories:
        top_category = max(categories, key=categories.get)
        top_amount = categories[top_category]
        percentage = (top_amount / total_expense_30d) * 100 if total_expense_30d > 0 else 0
        insights.append({
            "type": "info",
            "message": f"Your highest spending category is '{top_category}' at {top_amount:,.0f} "
                       f"({percentage:.0f}% of total expenses)."
        })
        if percentage > 30:
            potential_saving = top_amount * 0.2
            insights.append({
                "type": "tip",
                "message": f"You could save {potential_saving:,.0f} by reducing "
                           f"'{top_category}' expenses by 20%."
            })

    # Spending ratio alert
    if current_income > 0:
        expense_ratio = (current_expense / current_income) * 100
        if expense_ratio > 90:
            insights.append({
                "type": "alert",
                "message": f"Critical: You're using {expense_ratio:.0f}% of your income on expenses! "
                           f"Try to keep it under 70% for a healthy budget."
            })
        elif expense_ratio > 70:
            insights.append({
                "type": "warning",
                "message": f"You're spending {expense_ratio:.0f}% of your income. "
                           f"Aim for the 50-30-20 rule: 50% needs, 30% wants, 20% savings."
            })

    # No data yet
    if not categories and current_income == 0:
        insights.append({
            "type": "info",
            "message": "Welcome to BudgetIQ! Start by adding your income and expenses "
                       "to get personalized AI insights."
        })

    # Daily expense reminder
    today = datetime.now(timezone.utc).date()
    today_start = datetime.combine(today, datetime.min.time())
    today_end = today_start + timedelta(days=1)
    today_expenses = db.query(func.count(Expense.id)).filter(
        Expense.user_id == user_id,
        Expense.date >= today_start,
        Expense.date < today_end
    ).scalar()
    if today_expenses == 0:
        insights.append({
            "type": "info",
            "message": "Don't forget to log today's expenses for more accurate insights."
        })

    return insights


# ─── Chat Response (LLM-Powered) ─────────────────────────

def chat_response(db: Session, user_id: int, message: str) -> str:
    """
    Process a chat message using Gemini LLM with user's real financial context.
    Falls back to rule-based responses if Gemini is not available.
    """
    model = _get_gemini_model()

    if model is not None:
        return _gemini_chat(model, db, user_id, message)
    else:
        return _rule_based_chat(db, user_id, message)


def _gemini_chat(model, db: Session, user_id: int, message: str) -> str:
    """Send a message to Gemini with the user's financial context."""
    try:
        user_context = build_user_context(db, user_id)

        prompt = f"""{user_context}

=== USER QUESTION ===
{message}

Based on the financial data above, provide a helpful, personalized response. Remember:
- Only answer finance/budgeting questions
- Reference the user's actual numbers when relevant
- Be concise and actionable"""

        response = model.generate_content(prompt)

        if response and response.text:
            return response.text.strip()
        else:
            return "I couldn't generate a response right now. Please try again."

    except Exception as e:
        logger.error(f"Gemini API error: {e}")
        # Fall back to rule-based on error
        return _rule_based_chat(db, user_id, message)


def _rule_based_chat(db: Session, user_id: int, message: str) -> str:
    """Fallback rule-based chat when LLM is not available."""
    msg = message.lower().strip()

    # Check for non-finance topics first
    non_finance_keywords = [
        "weather", "recipe", "cook", "movie", "game", "sport", "music",
        "code", "program", "python", "java", "html", "css",
        "politics", "election", "president", "joke", "funny",
        "hello", "hi ", "hey ", "how are you", "what's up",
    ]

    # Allow greetings to pass through
    greetings = ["hello", "hi ", "hey ", "how are you", "what's up"]
    is_greeting = any(g in msg for g in greetings)

    if not is_greeting and any(kw in msg for kw in non_finance_keywords):
        return ("I'm your BudgetIQ financial assistant. I can only help with finance "
                "and budgeting topics. Please ask me about your budget, savings, "
                "expenses, or financial planning!")

    current_income, current_expense = get_monthly_totals(db, user_id, 0)
    balance = current_income - current_expense
    categories = get_category_breakdown(db, user_id, 30)
    total_expense = sum(categories.values()) if categories else 0

    # Greetings
    if is_greeting:
        if current_income == 0 and current_expense == 0:
            return ("Hello! I'm your BudgetIQ AI assistant. I can help you with "
                    "budgeting, saving strategies, and expense analysis.\n\n"
                    "Start by adding some income and expenses, then ask me anything "
                    "about your finances!")
        return (f"Hello! Here's a quick snapshot of your finances:\n\n"
                f"  Income: {current_income:,.0f}\n"
                f"  Expenses: {current_expense:,.0f}\n"
                f"  Balance: {balance:,.0f}\n\n"
                f"How can I help you with your budget today?")

    # Balance / Summary queries
    if any(word in msg for word in ["balance", "how much", "left", "remaining", "total", "summary", "overview"]):
        if current_income == 0 and current_expense == 0:
            return "You haven't added any income or expenses yet. Start tracking to see your balance!"
        status = "You're in a healthy financial position!" if balance > 0 else "Your expenses exceed your income. Let's work on a plan to reduce spending."
        return (
            f"Here's your financial summary this month:\n\n"
            f"  Income: {current_income:,.0f}\n"
            f"  Expenses: {current_expense:,.0f}\n"
            f"  Balance: {balance:,.0f}\n\n"
            f"{status}"
        )

    # Saving suggestions
    if any(word in msg for word in ["save", "saving", "savings", "reduce", "cut"]):
        if not categories:
            return "Add some expenses first so I can analyze where you can save!"
        top = max(categories, key=categories.get)
        saving = categories[top] * 0.2
        daily_limit = (current_income * 0.7 / 30) if current_income > 0 else 0
        response = (
            f"Here's a personalized savings plan based on your data:\n\n"
            f"  1. Your top spending category is '{top}' ({categories[top]:,.0f})\n"
            f"     Reducing it by 20% saves you {saving:,.0f}\n\n"
            f"  2. Follow the 50-30-20 rule:\n"
            f"     50% for needs, 30% for wants, 20% for savings\n"
        )
        if daily_limit > 0:
            response += f"\n  3. Set a daily spending limit of {daily_limit:,.0f}"
        return response

    # Spending breakdown
    if any(word in msg for word in ["spending", "spent", "expense", "category", "breakdown", "where"]):
        if not categories:
            return "No expense data available yet. Start logging your expenses to see your spending patterns!"
        breakdown = "\n".join(
            f"  {cat}: {amt:,.0f} ({(amt/total_expense*100):.0f}%)"
            for cat, amt in sorted(categories.items(), key=lambda x: -x[1])
        )
        return f"Your spending breakdown (last 30 days):\n\n{breakdown}\n\n  Total: {total_expense:,.0f}"

    # Income queries
    if any(word in msg for word in ["income", "earn", "salary", "revenue"]):
        if current_income == 0:
            return "You haven't added any income this month. Add your income to get started with budgeting!"
        return (
            f"Your income this month: {current_income:,.0f}\n\n"
            f"  Spent: {current_expense:,.0f} ({(current_expense/current_income*100):.0f}% of income)\n"
            f"  Remaining: {balance:,.0f}"
        )

    # Tips / Advice
    if any(word in msg for word in ["tip", "advice", "help", "suggest", "recommend", "guide"]):
        tips = [
            "Track every expense, no matter how small -- they add up!",
            "Follow the 50-30-20 rule: 50% needs, 30% wants, 20% savings.",
            "Set monthly spending limits for each category.",
            "Review your spending weekly to stay on track.",
            "Build an emergency fund worth 3-6 months of expenses.",
            "Avoid impulse purchases -- wait 24 hours before buying.",
            "Automate your savings by setting aside money on payday.",
        ]
        return "Here are some expert budgeting tips:\n\n" + "\n".join(f"  {i+1}. {t}" for i, t in enumerate(tips))

    # Comparison
    if any(word in msg for word in ["compare", "last month", "previous", "trend", "month over month"]):
        prev_income, prev_expense = get_monthly_totals(db, user_id, 1)
        if prev_expense == 0:
            return "Not enough data from last month to compare. Keep tracking and check back later!"
        change = current_expense - prev_expense
        pct = (change / prev_expense * 100) if prev_expense != 0 else 0
        direction = "increased" if change > 0 else "decreased"
        emoji_free_status = "Consider reviewing your spending habits." if change > 0 else "Great progress on reducing expenses!"
        return (
            f"Month-over-month comparison:\n\n"
            f"  Last month expenses: {prev_expense:,.0f}\n"
            f"  This month expenses: {current_expense:,.0f}\n"
            f"  Change: {direction} by {abs(change):,.0f} ({abs(pct):.1f}%)\n\n"
            f"{emoji_free_status}"
        )

    # Budget / 50-30-20 rule
    if any(word in msg for word in ["budget", "plan", "50-30-20", "rule", "allocat"]):
        if current_income == 0:
            return "Add your income first, and I'll help you create a budget plan based on the 50-30-20 rule!"
        needs = current_income * 0.50
        wants = current_income * 0.30
        savings = current_income * 0.20
        return (
            f"Here's a recommended budget based on your income ({current_income:,.0f}):\n\n"
            f"  Needs (50%):    {needs:,.0f}  -- rent, groceries, utilities\n"
            f"  Wants (30%):    {wants:,.0f}  -- dining, entertainment, shopping\n"
            f"  Savings (20%):  {savings:,.0f}  -- emergency fund, investments\n\n"
            f"Currently spending: {current_expense:,.0f} ({(current_expense/current_income*100):.0f}% of income)"
        )

    # Default — for unrecognized finance questions
    return (
        f"I'm your BudgetIQ financial assistant! Here's what I can help with:\n\n"
        f"  - Your balance or financial summary\n"
        f"  - Personalized saving strategies\n"
        f"  - Spending breakdown by category\n"
        f"  - Income analysis\n"
        f"  - Month-over-month comparison\n"
        f"  - Budget planning (50-30-20 rule)\n"
        f"  - Expert budgeting tips\n\n"
        f"Try asking: \"How can I save more?\" or \"Show my spending breakdown\""
    )

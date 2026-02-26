# BudgetIQ – AI-Based Personal Budget Management System

> A professional, fully functional budget management system with AI insights, modern UI, dark/light mode, and secure JWT authentication.

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vite + React 18 with vanilla CSS |
| Backend | Python FastAPI |
| Database | SQLite via SQLAlchemy |
| Auth | JWT with bcrypt password hashing |
| AI | Rule-based analysis engine |
| Charts | Recharts |
| Export | ReportLab (PDF) + openpyxl (Excel) |

## 🚀 Getting Started

### Prerequisites
- **Python 3.10+**
- **Node.js 18+**

### 1. Backend Setup

```bash
cd backend
pip install -r requirements.txt
python main.py
```

The API server starts at `http://localhost:8000`
- API docs: `http://localhost:8000/docs`

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend starts at `http://localhost:5173`

### 3. First-Time Usage

1. Open `http://localhost:5173` in your browser
2. Click **Sign Up** to create an account
3. Check the **backend terminal** for the email verification link
4. Open the verification link in your browser
5. Log in with your credentials
6. Start adding income and expenses!

## 📁 Project Structure

```
budgetiq/
├── backend/
│   ├── main.py              # FastAPI entry point
│   ├── config.py            # App configuration
│   ├── database.py          # SQLAlchemy setup
│   ├── models.py            # DB models
│   ├── schemas.py           # Pydantic schemas
│   ├── auth.py              # JWT auth utilities
│   ├── ai_engine.py         # AI insights engine
│   ├── requirements.txt
│   ├── uploads/             # Profile pictures
│   └── routes/
│       ├── auth_routes.py
│       ├── income_routes.py
│       ├── expense_routes.py
│       ├── dashboard_routes.py
│       ├── ai_routes.py
│       ├── notification_routes.py
│       ├── profile_routes.py
│       └── report_routes.py
├── frontend/
│   ├── index.html
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   ├── index.css
│   │   ├── context/
│   │   ├── pages/
│   │   ├── components/
│   │   └── utils/
│   └── package.json
└── README.md
```

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| GET | `/api/auth/verify-email?token=` | Verify email |
| POST | `/api/auth/login` | Login, get JWT |
| POST | `/api/auth/forgot-password` | Request reset link |
| GET | `/api/income` | List incomes |
| POST | `/api/income` | Add income |
| DELETE | `/api/income/{id}` | Delete income |
| GET | `/api/expenses` | List expenses |
| POST | `/api/expenses` | Add expense |
| DELETE | `/api/expenses/{id}` | Delete expense |
| GET | `/api/dashboard/summary` | Financial summary |
| GET | `/api/dashboard/chart-data?period=` | Chart data |
| GET | `/api/ai/insights` | AI insights |
| POST | `/api/ai/chat` | Chat with AI |
| GET | `/api/notifications` | Notifications |
| GET | `/api/profile` | Get profile |
| PUT | `/api/profile` | Update profile |
| POST | `/api/profile/avatar` | Upload avatar |
| GET | `/api/reports/pdf?period=` | Download PDF |
| GET | `/api/reports/excel?period=` | Download Excel |

## ✨ Features

- ✅ JWT Authentication with email verification
- ✅ Dark & Light mode
- ✅ Dashboard with interactive charts
- ✅ Income & Expense tracking
- ✅ AI-powered financial insights
- ✅ Chatbot for finance Q&A
- ✅ Notifications & alerts
- ✅ Profile management with avatar
- ✅ PDF & Excel report export
- ✅ Responsive design
- ✅ Secure logout on all pages

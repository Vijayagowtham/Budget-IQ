# BudgetIQ – AI-Based Personal Budget Management System

> A professional, fully functional budget management system with AI insights, modern UI, dark/light mode, and secure JWT authentication.

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vite + React 19 with vanilla CSS |
| Backend | Python FastAPI |
| Database | Supabase PostgreSQL (SQLite fallback for local dev) |
| Auth | JWT with bcrypt password hashing |
| AI | Google Gemini LLM + rule-based fallback |
| Charts | Recharts |
| Export | ReportLab (PDF) + openpyxl (Excel) |
| Deployment | Render (backend) + Vercel (frontend) |

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
3. Check the **backend terminal** for the email verification link (or your email if SMTP is configured)
4. Open the verification link in your browser
5. Log in with your credentials
6. Start adding income and expenses!

## 📁 Project Structure

```
budgetiq/
├── backend/
│   ├── main.py              # FastAPI entry point + rate limiter
│   ├── config.py            # App configuration (env vars)
│   ├── database.py          # SQLAlchemy setup (SQLite/PostgreSQL)
│   ├── models.py            # DB models (User, Income, Expense, Notification)
│   ├── schemas.py           # Pydantic request/response schemas
│   ├── auth.py              # JWT auth utilities
│   ├── ai_engine.py         # AI insights engine (Gemini + rules)
│   ├── email_utils.py       # Email verification via SMTP
│   ├── requirements.txt     # Pinned dependencies
│   ├── Procfile             # Render deployment
│   ├── .env.example         # Environment variables template
│   ├── supabase_setup.sql   # Database schema + RLS policies
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
│   │   ├── index.css         # 1500+ line design system
│   │   ├── context/          # Auth + Theme providers
│   │   ├── pages/            # Dashboard, Transactions, Profile, Reports, Login, Signup
│   │   ├── components/       # Sidebar, Navbar, AiPanel, NotificationBell, etc.
│   │   └── utils/api.js      # Axios client with JWT interceptor
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

## 🔐 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `SUPABASE_DB_URL` | Production | PostgreSQL connection string |
| `BUDGETIQ_SECRET_KEY` | Production | JWT signing key |
| `FRONTEND_URL` | Production | Vercel deployment URL |
| `BACKEND_URL` | Production | Render deployment URL |
| `GEMINI_API_KEY` | Optional | Google Gemini for AI chat |
| `SMTP_HOST` | Optional | SMTP server (e.g., smtp.gmail.com) |
| `SMTP_PORT` | Optional | SMTP port (default: 587) |
| `SMTP_USER` | Optional | SMTP username |
| `SMTP_PASSWORD` | Optional | SMTP password / App Password |
| `SMTP_FROM` | Optional | Sender email address |

## 🚀 Deployment

### Backend → Render
1. Push to GitHub
2. Create Web Service on [render.com](https://render.com)
3. Root directory: `backend`
4. Build: `pip install -r requirements.txt`
5. Start: `uvicorn main:app --host 0.0.0.0 --port $PORT`
6. Add environment variables

### Frontend → Vercel
1. Import on [vercel.com](https://vercel.com)
2. Root directory: `frontend`
3. Add env var: `VITE_API_URL=https://your-backend.onrender.com`

## ✨ Features

- ✅ JWT Authentication with email verification (SMTP or console)
- ✅ Dark & Light mode with smooth transitions
- ✅ Dashboard with interactive bar/line charts
- ✅ Income & Expense tracking with categories
- ✅ AI-powered financial insights (Gemini LLM + rule-based)
- ✅ AI Chatbot for personal finance Q&A
- ✅ Notifications & alerts system
- ✅ Profile management with avatar upload (5MB limit)
- ✅ PDF & Excel report export with branding
- ✅ Rate limiting on auth endpoints
- ✅ Responsive glassmorphism design
- ✅ Supabase PostgreSQL with SQLite fallback

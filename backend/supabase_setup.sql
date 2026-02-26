-- ============================================================
-- BudgetIQ – Supabase Database Setup
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New)
-- ============================================================

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    avatar_path VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 2. INCOMES TABLE
CREATE TABLE IF NOT EXISTS incomes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount DOUBLE PRECISION NOT NULL,
    source VARCHAR(200) NOT NULL,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_incomes_user ON incomes(user_id);

-- 3. EXPENSES TABLE
CREATE TABLE IF NOT EXISTS expenses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount DOUBLE PRECISION NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_expenses_user ON expenses(user_id);

-- 4. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);


-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- Ensures each user can only access their own data
-- ============================================================

-- Enable RLS on all user-data tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE incomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users: can read/update only their own row
CREATE POLICY users_self_access ON users
    FOR ALL
    USING (id = current_setting('app.current_user_id', true)::integer)
    WITH CHECK (id = current_setting('app.current_user_id', true)::integer);

-- Incomes: user can only CRUD their own income records
CREATE POLICY incomes_user_access ON incomes
    FOR ALL
    USING (user_id = current_setting('app.current_user_id', true)::integer)
    WITH CHECK (user_id = current_setting('app.current_user_id', true)::integer);

-- Expenses: user can only CRUD their own expense records
CREATE POLICY expenses_user_access ON expenses
    FOR ALL
    USING (user_id = current_setting('app.current_user_id', true)::integer)
    WITH CHECK (user_id = current_setting('app.current_user_id', true)::integer);

-- Notifications: user can only access their own notifications
CREATE POLICY notifications_user_access ON notifications
    FOR ALL
    USING (user_id = current_setting('app.current_user_id', true)::integer)
    WITH CHECK (user_id = current_setting('app.current_user_id', true)::integer);

-- ============================================================
-- Grant access to the service role (used by the backend API)
-- The backend connects as the postgres user, which bypasses RLS.
-- RLS above protects against direct Supabase client access.
-- ============================================================

-- NOTE: The backend API uses the postgres connection string which
-- has superuser privileges and bypasses RLS. The RLS policies above
-- protect data when using the Supabase JS client (anon key) directly.
-- The backend enforces user isolation via JWT + get_current_user dependency.

-- ============================================================
-- BudgetIQ – FIX: Disable RLS (run this in Supabase SQL Editor)
-- The backend handles all authorization via JWT + get_current_user.
-- RLS was blocking queries since the pooler connection doesn't
-- bypass it and app.current_user_id is never set.
-- ============================================================

-- Drop existing RLS policies
DROP POLICY IF EXISTS users_self_access ON users;
DROP POLICY IF EXISTS incomes_user_access ON incomes;
DROP POLICY IF EXISTS expenses_user_access ON expenses;
DROP POLICY IF EXISTS notifications_user_access ON notifications;

-- Disable RLS on all tables
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE incomes DISABLE ROW LEVEL SECURITY;
ALTER TABLE expenses DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;

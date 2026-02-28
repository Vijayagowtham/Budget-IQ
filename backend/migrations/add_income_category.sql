-- BudgetIQ Database Migration
-- Adds 'category' column to 'incomes' table

-- For SQLite (what we are currently using locally)
-- Note: SQLite ALTER TABLE ADD COLUMN does not support constraints like NOT NULL directly without a default,
-- so we add it with a default value.
ALTER TABLE incomes ADD COLUMN category VARCHAR(100) NOT NULL DEFAULT 'Other';

-- If this were PostgreSQL, it would be the same syntax.

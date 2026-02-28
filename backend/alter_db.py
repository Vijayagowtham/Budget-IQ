from dotenv import load_dotenv
load_dotenv()
from database import SessionLocal
from sqlalchemy import text
db = SessionLocal()
try:
    db.execute(text("ALTER TABLE incomes ADD COLUMN IF NOT EXISTS category VARCHAR(100) NOT NULL DEFAULT 'Other';"))
    db.commit()
    print("Column 'category' added to 'incomes' table successfully.")
except Exception as e:
    print(f"Error: {e}")

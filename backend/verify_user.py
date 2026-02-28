from dotenv import load_dotenv
load_dotenv()

from database import SessionLocal
from models import User

db = SessionLocal()
users = db.query(User).all()
count = 0
for u in users:
    print(f'User {u.email} - verified: {u.is_verified}')
    u.is_verified = True
    count += 1
db.commit()
print(f'Verified {count} users in the active database.')

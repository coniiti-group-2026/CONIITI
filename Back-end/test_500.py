from app.db.session import SessionLocal
from app.models.user import User
from app.services import session_service

db = SessionLocal()
try:
    user = db.query(User).first()
    if user:
        print(f"Testing for user {user.email}")
        sessions = session_service.get_user_registered_sessions(user, db)
        print("GET success:", sessions)
        
        # Test toggle
        first_session = session_service.list_sessions(db)[0]
        res = session_service.toggle_registration(first_session, user, db)
        print("TOGGLE success:", res)
    else:
        print("No users found.")
except Exception as e:
    import traceback
    traceback.print_exc()
finally:
    db.close()

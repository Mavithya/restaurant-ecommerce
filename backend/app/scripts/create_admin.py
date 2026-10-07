from getpass import getpass

from sqlalchemy import select

from app.core.security import get_password_hash
from app.db.database import SessionLocal, init_db
from app.models import User


def main():
    init_db()

    name = input("Admin name: ").strip()
    email = input("Admin email: ").strip().lower()
    password = getpass("Admin password: ")

    if not name or not email or not password:
        print("All fields are required.")
        return

    db = SessionLocal()

    try:
        existing_user = db.scalar(
            select(User).where(User.email == email)
        )

        if existing_user:
            print("A user with this email already exists.")
            return

        admin = User(
            name=name,
            email=email,
            password_hash=get_password_hash(password),
            role="ADMIN",
        )

        db.add(admin)
        db.commit()

        print("Admin user created successfully.")

    finally:
        db.close()


if __name__ == "__main__":
    main()
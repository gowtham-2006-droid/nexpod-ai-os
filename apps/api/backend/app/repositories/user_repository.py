from typing import Optional
from sqlalchemy.orm import Session
from ..models.entities import User
from ..services.auth_service import hash_password


DEFAULT_USERS = [
    {
        "id": "usr_admin_innovex",
        "email": "innovex",
        "password_hash": hash_password("innovex"),
        "role": "admin",
    },
    {
        "id": "usr_admin_innovex_email",
        "email": "innovex@nexpod.ai",
        "password_hash": hash_password("innovex"),
        "role": "admin",
    },
    {
        "id": "usr_admin_01",
        "email": "admin@nexpod.ai",
        "password_hash": hash_password("admin123"),
        "role": "admin",
    },
    {
        "id": "usr_cust_01",
        "email": "customer@nexpod.ai",
        "password_hash": hash_password("customer123"),
        "role": "user",
    },
]


class UserRepository:
    def __init__(self, session: Session):
        self.session = session

    def get_by_email(self, email: str) -> Optional[User]:
        return self.session.query(User).filter(User.email == email.lower().strip()).first()

    def get_by_id(self, user_id: str) -> Optional[User]:
        return self.session.get(User, user_id)

    def create_user(self, user_id: str, email: str, raw_password: str, role: str = "user") -> User:
        user = User(
            id=user_id,
            email=email.lower().strip(),
            password_hash=hash_password(raw_password),
            role=role,
        )
        self.session.add(user)
        self.session.commit()
        self.session.refresh(user)
        return user

    def seed_default_users(self) -> None:
        """Seeds default admin and customer accounts into Supabase PostgreSQL if missing."""
        for u in DEFAULT_USERS:
            existing = self.get_by_email(u["email"])
            if not existing:
                user = User(
                    id=u["id"],
                    email=u["email"],
                    password_hash=u["password_hash"],
                    role=u["role"],
                )
                self.session.merge(user)
        self.session.commit()

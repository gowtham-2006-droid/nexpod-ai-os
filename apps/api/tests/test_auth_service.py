import pytest
from backend.app.services.auth_service import (
    hash_password,
    verify_password,
    create_access_token,
    decode_access_token
)

def test_password_hashing():
    raw_pass = "admin123"
    hashed = hash_password(raw_pass)
    assert hashed != raw_pass
    assert verify_password("admin123", hashed) is True
    assert verify_password("wrongpass", hashed) is False

def test_jwt_token_flow():
    user_id = "usr_admin_01"
    email = "admin@nexpod.ai"
    role = "admin"

    token = create_access_token(user_id, email, role)
    assert isinstance(token, str)
    assert len(token.split('.')) == 3

    payload = decode_access_token(token)
    assert payload is not None
    assert payload["sub"] == user_id
    assert payload["email"] == email
    assert payload["role"] == role

def test_invalid_token():
    invalid_token = "invalid.token.structure"
    assert decode_access_token(invalid_token) is None


def test_user_repository_seeding():
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker
    from backend.app.database.session import Base
    from backend.app.repositories.user_repository import UserRepository

    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)

    with Session() as session:
        repo = UserRepository(session)
        repo.seed_default_users()

        user = repo.get_by_email("innovex")
        assert user is not None
        assert user.role == "admin"
        assert verify_password("innovex", user.password_hash) is True

        user_email = repo.get_by_email("innovex@nexpod.ai")
        assert user_email is not None
        assert user_email.role == "admin"

        new_user = repo.create_user("usr_test_01", "newuser@nexpod.ai", "secret123", "admin")
        assert new_user.email == "newuser@nexpod.ai"
        assert verify_password("secret123", new_user.password_hash) is True


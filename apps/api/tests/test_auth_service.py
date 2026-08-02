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

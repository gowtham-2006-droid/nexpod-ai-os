import base64
import hashlib
import hmac
import json
import time
from typing import List, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

SECRET_KEY = "nexpod-secret-key-super-secure-change-in-prod"
ALGORITHM = "HS256"
TOKEN_EXPIRE_SECONDS = 86400 * 7  # 7 days

security_scheme = HTTPBearer(auto_error=False)

def hash_password(password: str) -> str:
    """Hashes password using SHA256 with salt."""
    salt = "nexpod_salt_2026"
    return hashlib.sha256((password + salt).encode('utf-8')).hexdigest()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain password against hashed password."""
    return hash_password(plain_password) == hashed_password

def create_access_token(user_id: str, email: str, role: str) -> str:
    """Creates a base64url HMAC-SHA256 signed bearer token."""
    header = {"alg": "HS256", "typ": "JWT"}
    payload = {
        "sub": user_id,
        "email": email,
        "role": role,
        "exp": int(time.time()) + TOKEN_EXPIRE_SECONDS
    }

    def b64_encode(data: dict) -> str:
        dumped = json.dumps(data, separators=(',', ':')).encode('utf-8')
        return base64.urlsafe_b64encode(dumped).decode('utf-8').rstrip('=')

    header_b64 = b64_encode(header)
    payload_b64 = b64_encode(payload)
    message = f"{header_b64}.{payload_b64}".encode('utf-8')

    signature = hmac.new(SECRET_KEY.encode('utf-8'), message, hashlib.sha256).digest()
    sig_b64 = base64.urlsafe_b64encode(signature).decode('utf-8').rstrip('=')

    return f"{header_b64}.{payload_b64}.{sig_b64}"

def decode_access_token(token: str) -> Optional[dict]:
    """Decodes and validates a signed bearer token."""
    try:
        parts = token.split('.')
        if len(parts) != 3:
            return None
        
        header_b64, payload_b64, sig_b64 = parts
        message = f"{header_b64}.{payload_b64}".encode('utf-8')

        # Re-compute signature
        expected_sig = hmac.new(SECRET_KEY.encode('utf-8'), message, hashlib.sha256).digest()
        
        # Add padding back for base64 decoding if needed
        sig_padded = sig_b64 + '=' * (-len(sig_b64) % 4)
        actual_sig = base64.urlsafe_b64decode(sig_padded.encode('utf-8'))

        if not hmac.compare_digest(expected_sig, actual_sig):
            return None

        payload_padded = payload_b64 + '=' * (-len(payload_b64) % 4)
        payload_data = json.loads(base64.urlsafe_b64decode(payload_padded.encode('utf-8')).decode('utf-8'))

        if payload_data.get("exp", 0) < time.time():
            return None

        return payload_data
    except Exception:
        return None

def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme)) -> Optional[dict]:
    """Dependency to extract user info from Authorization header."""
    if not credentials or not credentials.credentials:
        return None
    token = credentials.credentials
    return decode_access_token(token)

def require_role(allowed_roles: List[str]):
    """Dependency factory enforcing allowed user roles on FastAPI routes."""
    def role_checker(user: Optional[dict] = Depends(get_current_user)):
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication required. Please provide a valid Bearer token.",
                headers={"WWW-Authenticate": "Bearer"},
            )
        user_role = user.get("role", "user")
        if user_role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access forbidden for role '{user_role}'. Required: {allowed_roles}"
            )
        return user
    return role_checker

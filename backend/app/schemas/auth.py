from pydantic import BaseModel
from typing import Optional

# Schema for returning access/refresh tokens
class Token(BaseModel):
    access_token: str
    refresh_token: Optional[str] = None # Include refresh token on login
    token_type: str = "bearer"

# Schema for the data stored within the JWT access token
class TokenPayload(BaseModel):
    sub: Optional[str] = None # Subject (usually user ID or email)
    # Add other claims as needed (e.g., exp, iat, roles)

# Schema for receiving refresh token
class RefreshToken(BaseModel):
    refresh_token: str

# If you use OAuth2PasswordRequestForm for login, you might not need a custom Login schema.
# Otherwise, define one here:
# class LoginRequest(BaseModel):
#     email: EmailStr
#     password: str 
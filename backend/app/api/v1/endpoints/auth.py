from typing import Any, Optional

from fastapi import APIRouter, Depends, HTTPException, status, Body
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from sqlmodel import Session

from app import crud, models, schemas
from app.api import deps # We will create this dependency file next
from app.core import security
from app.core.config import settings

router = APIRouter()


@router.post("/login", response_model=schemas.Token)
def login_access_token(
    db: Session = Depends(deps.get_db),
    form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests.
    Uses username or email.
    """
    user = crud.user.authenticate(
        db, username_or_email=form_data.username, password=form_data.password
    )
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect email/username or password")
    elif not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")

    access_token = security.create_access_token(
        subject=user.id, # Use user ID as subject
    )
    refresh_token = security.create_refresh_token(
        subject=user.id
    )
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        # Optionally return user info here as well, based on frontend needs
        # "user": schemas.UserRead.from_orm(user) # Pydantic V1 style
        # "user": schemas.UserRead.model_validate(user) # Pydantic V2 style
    }

@router.post("/refresh", response_model=schemas.Token)
def refresh_access_token(
    db: Session = Depends(deps.get_db),
    refresh_token_data: schemas.RefreshToken = Body(...)
) -> Any:
    """
    Get a new access token from a refresh token.
    """
    token_payload = security.decode_token(refresh_token_data.refresh_token)
    if not token_payload or token_payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user_id = token_payload.sub
    user = crud.user.get(db, id=int(user_id))
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive",
            headers={"WWW-Authenticate": "Bearer"},
        )
    # Create new access token, but not a new refresh token
    new_access_token = security.create_access_token(subject=user.id)
    return {
        "access_token": new_access_token,
        "token_type": "bearer",
    }


@router.get("/me", response_model=schemas.UserRead)
def read_users_me(
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get current user.
    """
    # Add branch info if needed by frontend
    # user_data = schemas.UserRead.from_orm(current_user)
    # user_data.branch = schemas.BranchSettingRead.from_orm(current_user.branch) if current_user.branch else None
    # return user_data
    return current_user 
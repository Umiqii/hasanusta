from typing import Any, List

from fastapi import APIRouter, Body, Depends, HTTPException
from sqlmodel import Session

from app import crud, models, schemas
from app.api import deps
from app.core.config import settings

router = APIRouter()


@router.post("/signup", response_model=schemas.UserRead)
def create_user_signup(
    *, 
    db: Session = Depends(deps.get_db), 
    user_in: schemas.UserCreate
) -> Any:
    """
    Create new user without the need to be logged in.
    (Consider if this should be admin-only or require an invitation system).
    """
    user = crud.user.get_by_email(db, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )
    user = crud.user.get_by_username(db, username=user_in.username)
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this username already exists in the system.",
        )
    
    # Add logic here to restrict signup if needed (e.g., check for invite code)
    
    # Assign default roles/permissions (e.g., set is_superuser=False explicitly)
    user_in.is_superuser = False # Ensure new signups are not superusers by default

    user = crud.user.create(db=db, obj_in=user_in)
    return user

# Add other user management endpoints here if needed (e.g., list users, update user)
# These should typically require admin privileges (e.g., Depends(deps.get_current_active_superuser))

# Example: Get all users (Superuser only)
# @router.get("/", response_model=List[schemas.UserRead])
# def read_users(
#     db: Session = Depends(deps.get_db),
#     skip: int = 0,
#     limit: int = 100,
#     current_user: models.User = Depends(deps.get_current_active_superuser),
# ) -> Any:
#     """
#     Retrieve users.
#     """
#     users = crud.user.get_multi(db, skip=skip, limit=limit) # Assumes get_multi exists
#     return users 
from typing import Generator, Optional, Union

from fastapi import Depends, HTTPException, status, Path
from fastapi.security import OAuth2PasswordBearer
from sqlmodel import Session

from app import crud, models, schemas
from app.core import security
from app.core.config import settings
from app.db.session import SessionLocal, get_db # Import get_db from session

reusable_oauth2 = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login"
)

def get_current_user(
    db: Session = Depends(get_db),
    token: str = Depends(reusable_oauth2)
) -> Optional[models.User]:
    token_data = security.decode_token(token)
    if not token_data:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate credentials (invalid token)",
        )
    user = crud.user.get(db, id=int(token_data.sub))
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

def get_current_active_user(
    current_user: models.User = Depends(get_current_user),
) -> models.User:
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

def get_current_active_superuser(
    current_user: models.User = Depends(get_current_active_user),
) -> models.User:
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=403, detail="The user doesn't have enough privileges"
        )
    return current_user

# Dependency to check if user can access a specific branch
def get_branch_access_dependency(
    branch_id: Union[int, str] = Path(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
) -> models.BranchSetting:
    # Check if superuser (can access all)
    if current_user.is_superuser:
        branch = crud.branch.get_by_id_or_slug(db, id_or_slug=branch_id)
        if not branch:
            raise HTTPException(status_code=404, detail="Branch not found")
        return branch

    # Check if user is assigned to this branch
    branch = crud.branch.get_by_id_or_slug(db, id_or_slug=branch_id)
    if not branch:
            raise HTTPException(status_code=404, detail="Branch not found")

    if current_user.branch_id != branch.id:
        raise HTTPException(
            status_code=403,
            detail="User does not have access to this branch"
        )
    return branch

# Dependency to get the current user's branch ID (or None if superuser)
def get_optional_user_branch_id(
    current_user: models.User = Depends(get_current_active_user)
) -> Optional[int]:
    if current_user.is_superuser:
        return None
    return current_user.branch_id 
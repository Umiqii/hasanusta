from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from app import crud, models, schemas
from app.api import deps

router = APIRouter()


# POST endpoint is public
@router.post("/", response_model=schemas.MessageRead, status_code=status.HTTP_201_CREATED)
def create_message(
    *, # Keyword-only arguments
    db: Session = Depends(deps.get_db),
    message_in: schemas.MessageCreate,
) -> Any:
    """
    Create new message. Public access.
    """
    message_obj = crud.message.create(db=db, obj_in=message_in)
    return message_obj

# GET endpoint requires authentication (any active admin can see)
@router.get("/", response_model=List[schemas.MessageRead])
def read_messages(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_active_user), # Ensures user is active
) -> Any:
    """
    Retrieve messages.
    Requires authentication.
    Filters messages by the user's assigned branch if the user is not a superuser.
    """
    user_branch_id = None
    if not current_user.is_superuser:
        user_branch_id = current_user.branch_id
        if user_branch_id is None:
             # If a non-superuser is not assigned to a branch, they see nothing
             return [] 

    messages = crud.message.get_multi(
        db,
        branch_id=user_branch_id, # Pass branch_id for filtering
        skip=skip, 
        limit=limit
    )
    return messages 
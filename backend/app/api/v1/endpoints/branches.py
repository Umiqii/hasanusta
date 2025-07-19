from typing import Any, List, Union

from fastapi import APIRouter, Depends, HTTPException, Path
from sqlmodel import Session

from app import crud, models, schemas
from app.api import deps

router = APIRouter()


@router.get("/", response_model=List[schemas.BranchSettingRead])
def read_branches(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve branch settings. 
    Filters based on the user's assigned branch unless the user is a superuser.
    """
    user_branch_id = None if current_user.is_superuser else current_user.branch_id
    branches = crud.branch.get_multi_by_owner(
        db, user_branch_id=user_branch_id, skip=skip, limit=limit
    )
    return branches


@router.get("/{branch_id}", response_model=schemas.BranchSettingRead)
def read_branch(
    branch_id: Union[int, str] = Path(...),
    db: Session = Depends(deps.get_db),
    # Use the branch access dependency to check permissions
    branch: models.BranchSetting = Depends(deps.get_branch_access_dependency)
) -> Any:
    """
    Get branch by ID or slug. Ensures user has access.
    """
    # The dependency already fetched and validated the branch
    return branch


@router.put("/{branch_id}", response_model=schemas.BranchSettingRead)
def update_branch(
    *, # Make parameters keyword-only
    db: Session = Depends(deps.get_db),
    branch_id: int,
    branch_in: schemas.BranchSettingUpdate,
    # Ensure user has access to this specific branch ID
    current_branch: models.BranchSetting = Depends(deps.get_branch_access_dependency)
) -> Any:
    """
    Update a branch. User must have access to the branch.
    Note: Requires branch_id in the path.
    The dependency ensures the user can access current_branch (which has branch_id).
    """
    # Check if slug is being updated and if it's already taken
    if branch_in.slug and branch_in.slug != current_branch.slug:
        existing_branch = crud.branch.get_by_slug(db, slug=branch_in.slug)
        if existing_branch and existing_branch.id != branch_id:
            raise HTTPException(status_code=400, detail="Branch slug already in use.")
            
    branch_updated = crud.branch.update(db=db, db_obj=current_branch, obj_in=branch_in)
    return branch_updated

# Add POST endpoint for creating branches (likely superuser only)
@router.post("/", response_model=schemas.BranchSettingRead)
def create_branch(
    *, 
    db: Session = Depends(deps.get_db),
    branch_in: schemas.BranchSettingCreate,
    current_user: models.User = Depends(deps.get_current_active_superuser)
) -> Any:
    """
    Create new branch. Superuser only.
    """
    # CRUD sınıfında slug kontrolü var mı kontrol et, yoksa burada yap
    existing_branch = crud.branch.get_by_slug(db, slug=branch_in.slug) 
    if existing_branch:
        raise HTTPException(status_code=400, detail="Branch slug already exists.")
    # crud.branch.create_branch yerine crud.branch.create kullan
    branch = crud.branch.create(db=db, obj_in=branch_in)
    return branch 
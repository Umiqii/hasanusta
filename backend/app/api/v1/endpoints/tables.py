from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from app import crud, models, schemas
from app.api import deps

router = APIRouter()


@router.get("/", response_model=List[schemas.ManagedTableRead])
def read_tables(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve tables for the user's branch (or all for superuser).
    """
    user_branch_id = None if current_user.is_superuser else current_user.branch_id
    if user_branch_id is None and not current_user.is_superuser:
         # This case should ideally not happen if non-superusers always have a branch
         raise HTTPException(status_code=403, detail="User is not assigned to a branch")
         
    tables = crud.table.get_multi_by_branch(
        db, branch_id=user_branch_id, skip=skip, limit=limit
    )
    return tables


@router.post("/bulk", response_model=List[schemas.ManagedTableRead])
def create_tables_bulk(
    *, # Keyword-only arguments
    db: Session = Depends(deps.get_db),
    tables_in: schemas.ManagedTableBulkCreate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create tables in bulk for the current user's branch.
    Superusers cannot use this endpoint directly, they need to act via a branch.
    """
    if current_user.is_superuser:
        raise HTTPException(
            status_code=403, 
            detail="Superusers cannot directly create bulk tables without specifying a branch context."
            # Potentially allow superusers if they pass branch_id in request? Requires schema change.
        )
        
    if not current_user.branch_id:
        raise HTTPException(status_code=403, detail="User is not assigned to a branch")
    
    # Get the user's branch slug needed for link generation
    branch = crud.branch.get(db, id=current_user.branch_id)
    if not branch: # Should not happen if branch_id is set
        raise HTTPException(status_code=404, detail="User's assigned branch not found")

    # Validate start/end numbers
    if tables_in.start_number <= 0 or tables_in.end_number < tables_in.start_number:
        raise HTTPException(status_code=400, detail="Invalid start or end table number.")
    
    # Optional: Add limit to bulk creation size?
    # if tables_in.end_number - tables_in.start_number > 100: # Example limit
    #     raise HTTPException(status_code=400, detail="Cannot create more than 100 tables at once.")

    created_tables = crud.table.create_bulk(
        db=db, tables_in=tables_in, branch=branch
    )
    return created_tables


@router.delete("/bulk", status_code=status.HTTP_200_OK)
def delete_tables_bulk(
    *, # Keyword-only arguments
    db: Session = Depends(deps.get_db),
    tables_in: schemas.ManagedTableBulkDelete,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Delete tables in bulk. Ensures tables belong to the user's branch.
    """
    if current_user.is_superuser:
         raise HTTPException(
            status_code=403, 
            detail="Superusers cannot directly delete bulk tables without specifying a branch context."
        )
    if not current_user.branch_id:
        raise HTTPException(status_code=403, detail="User is not assigned to a branch")

    deleted_count = crud.table.remove_bulk(
        db=db, table_ids=tables_in.table_ids, branch_id=current_user.branch_id
    )
    if deleted_count != len(tables_in.table_ids):
        # This indicates some IDs didn't belong to the branch or didn't exist
        # You might want to log this or return a more specific message
        pass 
    return {"message": f"Successfully deleted {deleted_count} tables.", "deleted_count": deleted_count}


@router.put("/{table_id}", response_model=schemas.ManagedTableRead)
def update_table(
    *, # Keyword-only arguments
    db: Session = Depends(deps.get_db),
    table_id: int,
    table_in: schemas.ManagedTableUpdate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update a table's settings (overrides). Ensures table belongs to user's branch.
    """
    db_table = crud.table.get(db, id=table_id)
    if not db_table:
        raise HTTPException(status_code=404, detail="Table not found")

    # Check authorization: Superuser or user assigned to the table's branch
    if not current_user.is_superuser and db_table.branch_id != current_user.branch_id:
         raise HTTPException(status_code=403, detail="Not authorized to update this table")

    # Get branch slug for link regeneration
    # Avoid extra DB call if user is not superuser (we already know the branch)
    if current_user.is_superuser:
         branch = crud.branch.get(db, id=db_table.branch_id)
         if not branch:
              raise HTTPException(status_code=404, detail="Table's associated branch not found") # Data integrity issue
         branch_slug = branch.slug
    else:
         # User is assigned to this branch, fetch branch info if needed (or get slug from user?)
         branch = crud.branch.get(db, id=current_user.branch_id)
         if not branch:
             raise HTTPException(status_code=404, detail="User's assigned branch not found")
         branch_slug = branch.slug

    updated_table = crud.table.update_with_link_regen(
        db=db, db_obj=db_table, obj_in=table_in, branch_slug=branch.slug
    )
    return updated_table 
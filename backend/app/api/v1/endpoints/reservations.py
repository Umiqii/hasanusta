from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from app import crud, models, schemas
from app.api import deps

router = APIRouter()

# POST endpoint is public
@router.post("/", response_model=schemas.ReservationRead, status_code=status.HTTP_201_CREATED)
def create_reservation(
    *, # Keyword-only arguments
    db: Session = Depends(deps.get_db),
    reservation_in: schemas.ReservationCreate,
) -> Any:
    """
    Create new reservation. Public access.
    """
    reservation_obj = crud.reservation.create_with_branch_key_check(db=db, obj_in=reservation_in)
    if not reservation_obj:
        raise HTTPException(
            status_code=400,
            detail="Invalid branch key provided.",
        )
    return reservation_obj

# GET endpoint requires authentication and filters by user's branch
@router.get("/", response_model=List[schemas.ReservationRead])
def read_reservations(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve reservations for the user's branch (or all for superuser).
    Requires authentication.
    """
    user_branch_id = None if current_user.is_superuser else current_user.branch_id
    # The CRUD function handles filtering based on user_branch_id (by fetching slug)
    reservations = crud.reservation.get_multi_by_branch(
        db, branch_id=user_branch_id, skip=skip, limit=limit
    )
    return reservations

# PATCH endpoint requires authentication and checks ownership
@router.patch("/{reservation_id}", response_model=schemas.ReservationRead)
def update_reservation_status(
    *, # Keyword-only arguments
    db: Session = Depends(deps.get_db),
    reservation_id: int,
    reservation_in: schemas.ReservationUpdate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update a reservation's status. Requires authentication.
    Ensures the reservation belongs to the user's branch (unless superuser).
    """
    db_reservation = crud.reservation.get(db, id=reservation_id)
    if not db_reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")

    # Authorization check
    if not current_user.is_superuser:
        if not current_user.branch_id:
             raise HTTPException(status_code=403, detail="User is not assigned to a branch")
        # Check if reservation's branch_key matches user's branch slug
        branch = crud.branch.get(db, id=current_user.branch_id)
        if not branch or db_reservation.branch_key != branch.slug:
            raise HTTPException(status_code=403, detail="Not authorized to update this reservation")

    updated_reservation = crud.reservation.update_status(
        db=db, db_obj=db_reservation, obj_in=reservation_in
    )
    return updated_reservation 
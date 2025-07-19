from typing import Any, Dict, Optional, Union, List

from sqlmodel import Session, select

from app.crud.base import CRUDBase
from app.models.models import Reservation, BranchSetting
from app.schemas.reservation import ReservationCreate, ReservationUpdate

# Import branch CRUD to find branch by slug
from .crud_branch import branch as crud_branch # Renamed to avoid conflict

class CRUDReservation(CRUDBase[Reservation, ReservationCreate, ReservationUpdate]):

    def get_multi_by_branch(
        self, db: Session, *, branch_id: Optional[int], skip: int = 0, limit: int = 100
    ) -> List[Reservation]:
        """Get reservations for a specific branch (or all if branch_id is None - for superuser)."""
        statement = select(self.model)
        if branch_id is not None:
            # Use db.get directly to fetch the branch by its primary key (id)
            branch_obj: Optional[BranchSetting] = db.get(BranchSetting, branch_id)
            if branch_obj:
                # Filter reservations based on the branch SLUG found
                statement = statement.where(Reservation.branch_key == branch_obj.slug)
            else:
                # If branch not found, return empty list
                return []
        statement = statement.order_by(self.model.received_at.desc()).offset(skip).limit(limit)
        # Use session.execute and scalars for SQLModel/SQLAlchemy 2.0+
        results = db.execute(statement)
        return results.scalars().all()

    def create_with_branch_key_check(self, db: Session, *, obj_in: ReservationCreate) -> Optional[Reservation]:
        """Creates a reservation after validating the branch_key."""
        # Assuming branch_key from frontend corresponds to BranchSetting.slug
        branch_obj = crud_branch.get_by_slug(db, slug=obj_in.branch_key)
        if not branch_obj:
            # Consider raising an HTTPException(404, "Branch not found") here
            return None 
        # Create the reservation object
        db_obj = Reservation.model_validate(obj_in)
        # Set the found branch_id (or keep branch_key? Check model relation)
        # If Reservation model links via branch_id, set it:
        # db_obj.branch_id = branch_obj.id 
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update_status(
        self, db: Session, *, db_obj: Reservation, obj_in: ReservationUpdate
    ) -> Reservation:
        """Updates the status of a reservation."""
        # Update only the status field
        update_data = obj_in.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_obj, key, value)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

# Create an instance
reservation = CRUDReservation(Reservation) 
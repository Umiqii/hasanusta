from typing import Any, Dict, Optional, Union, List

from sqlmodel import Session, select

from app.crud.base import CRUDBase
from app.models.models import BranchSetting
from app.schemas.branch import BranchSettingCreate, BranchSettingUpdate


class CRUDBranch(CRUDBase[BranchSetting, BranchSettingCreate, BranchSettingUpdate]):

    def get_by_slug(self, db: Session, *, slug: str) -> Optional[BranchSetting]:
        statement = select(self.model).where(self.model.slug == slug)
        return db.execute(statement).scalars().first()

    def get_by_id_or_slug(self, db: Session, *, id_or_slug: Union[int, str]) -> Optional[BranchSetting]:
        branch_id: Optional[int] = None
        branch_slug: Optional[str] = None

        if isinstance(id_or_slug, int):
            branch_id = id_or_slug
        elif isinstance(id_or_slug, str) and id_or_slug.isdigit():
            # If it's a string but contains only digits, treat it as an ID
            try:
                branch_id = int(id_or_slug)
            except ValueError:
                # Should not happen if isdigit() is true, but safety first
                branch_slug = id_or_slug 
        elif isinstance(id_or_slug, str):
             # Assume it's a slug
            branch_slug = id_or_slug
        else:
             # Handle unexpected types if necessary, though Union should prevent this
            return None 

        if branch_id is not None:
            # Use the base class get method which uses db.get()
            return self.get(db, id=branch_id) 
        elif branch_slug is not None:
            return self.get_by_slug(db, slug=branch_slug)
        else:
            # Should not be reachable if id_or_slug has a value
            return None

    def get_multi_by_owner(
        self, db: Session, *, user_branch_id: Optional[int], skip: int = 0, limit: int = 100
    ) -> List[BranchSetting]:
        """Get branches for a specific user (either their assigned branch or all if superuser)."""
        statement = select(self.model)
        if user_branch_id is not None: # Filter by branch if user is not superuser
            statement = statement.where(self.model.id == user_branch_id)
        # Order by name for consistency
        statement = statement.order_by(self.model.name).offset(skip).limit(limit) 
        results = db.execute(statement)
        # For get_multi, execute returns rows, not just scalars if model fields are selected implicitly
        # If it returns tuples/rows, .all() is correct. If only the model instance, use .scalars().all()
        # Let's assume it returns model instances based on `select(self.model)`
        return results.scalars().all() 

    # create and update methods are inherited from CRUDBase

# Create an instance
branch = CRUDBranch(BranchSetting)

# Standalone functions below might be redundant now
# def get_branch(db: Session, branch_id: int) -> Optional[BranchSetting]:
#     return db.get(BranchSetting, branch_id)

# def get_multi(
#     db: Session, *, skip: int = 0, limit: int = 100
# ) -> List[BranchSetting]:
#     statement = select(BranchSetting).offset(skip).limit(limit)
#     return db.execute(statement).all()

# Add delete_branch if needed
# def remove_branch(db: Session, *, id: int) -> BranchSetting:
#     db_obj = db.get(BranchSetting, id)
#     db.delete(db_obj)
#     db.commit()
#     return db_obj 
from typing import Any, Dict, Optional, Union, List

from sqlmodel import Session, select

from app.crud.base import CRUDBase
from app.models.models import Application, BranchSetting
from app.schemas.application import ApplicationCreate

# Import branch CRUD to find branch by slug
from .crud_branch import branch as crud_branch # Renamed to avoid conflict

# BaseModel'i import etmemiz gerekebilir, çünkü CRUDBase generic'inde kullanılıyor
from pydantic import BaseModel

class CRUDApplication(CRUDBase[Application, ApplicationCreate, BaseModel]): # Using dummy Update schema

    def get_multi_by_branch(
        self, db: Session, *, branch_id: Optional[int], skip: int = 0, limit: int = 100
    ) -> List[Application]:
        """Get applications for a specific branch (or all if branch_id is None - for superuser)."""
        statement = select(self.model)
        if branch_id is not None:
            # Use db.get directly to fetch the branch by its primary key (id)
            branch_obj: Optional[BranchSetting] = db.get(BranchSetting, branch_id)
            if branch_obj:
                 # Filter applications based on the branch SLUG found
                statement = statement.where(self.model.branch_key == branch_obj.slug)
            else:
                # If branch not found, return empty list
                return []
        statement = statement.order_by(self.model.submitted_at.desc()).offset(skip).limit(limit)
        # Use session.execute and scalars for SQLModel/SQLAlchemy 2.0+
        results = db.execute(statement)
        return results.scalars().all()

    def create_with_cv_path(self, db: Session, *, obj_in: ApplicationCreate, cv_file_path: str) -> Optional[Application]:
        """Creates an application after validating the branch_key and saving the CV path."""
        # Assuming branch_key from frontend corresponds to BranchSetting.slug
        branch_obj = crud_branch.get_by_slug(db, slug=obj_in.branch_key)
        if not branch_obj:
             # Consider raising an HTTPException(404, "Branch not found") here
            return None
            
        # Create the application object including the cv_file_path
        application_data = obj_in.model_dump() 
        db_obj = self.model(**application_data, cv_file_path=cv_file_path)
         # Set the found branch_id (or keep branch_key? Check model relation)
        # If Application model links via branch_id, set it:
        # db_obj.branch_id = branch_obj.id 
        
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

# Create an instance
application = CRUDApplication(Application)

# Below functions might be redundant if using the CRUD class instance
# def get_application(db: Session, application_id: int) -> Optional[Application]:
#     return db.get(Application, application_id)

# No update for applications usually, maybe delete?
# def remove_application(db: Session, *, id: int) -> Application:
#     db_obj = db.get(Application, id)
#     db.delete(db_obj)
#     db.commit()
#     # Optionally delete the associated CV file from storage
#     return db_obj 
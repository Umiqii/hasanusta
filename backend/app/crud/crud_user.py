from typing import Any, Dict, Optional, Union

from sqlmodel import Session, select

from app.core.security import get_password_hash, verify_password
from app.crud.base import CRUDBase
from app.models.models import User
from app.schemas.user import UserCreate, UserUpdate


class CRUDUser(CRUDBase[User, UserCreate, UserUpdate]):
    def get_by_email(self, db: Session, *, email: str) -> Optional[User]:
        statement = select(self.model).where(self.model.email == email)
        result = db.execute(statement)
        return result.scalars().first()

    def get_by_username(self, db: Session, *, username: str) -> Optional[User]:
        statement = select(self.model).where(self.model.username == username)
        result = db.execute(statement)
        return result.scalars().first()

    def create(self, db: Session, *, obj_in: UserCreate) -> User:
        # Use model_validate for Pydantic V2
        db_obj = self.model.model_validate(
            obj_in, 
            update={"hashed_password": get_password_hash(obj_in.password)}
        )
        # Remove password from the validated object before saving if needed
        # (model_validate should handle extra fields based on model definition)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update(
        self, db: Session, *, db_obj: User, obj_in: Union[UserUpdate, Dict[str, Any]]
    ) -> User:
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            # Use model_dump for Pydantic V2
            update_data = obj_in.model_dump(exclude_unset=True) 
        
        if "password" in update_data and update_data["password"]:
            hashed_password = get_password_hash(update_data["password"])
            del update_data["password"]
            update_data["hashed_password"] = hashed_password
            
        return super().update(db, db_obj=db_obj, obj_in=update_data)

    def authenticate(
        self, db: Session, *, username_or_email: str, password: str
    ) -> Optional[User]:
        user = self.get_by_email(db, email=username_or_email)
        if not user:
            user = self.get_by_username(db, username=username_or_email)
        if not user:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        return user

# Create an instance of the CRUD class for User model
user = CRUDUser(User) 
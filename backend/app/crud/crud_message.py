from typing import Any, Dict, Optional, Union, List

from sqlmodel import Session, select
from pydantic import BaseModel

from app.crud.base import CRUDBase
from app.models.models import Message, BranchSetting
from app.schemas.message import MessageCreate


class CRUDMessage(CRUDBase[Message, MessageCreate, BaseModel]): # UpdateSchema is dummy
    # get, get_multi, create are inherited and sufficient
    # No special methods needed for messages unless filtering is required
    def get_multi(
        self,
        db: Session, 
        *, 
        branch_id: Optional[int] = None,
        skip: int = 0, 
        limit: int = 100
    ) -> List[Message]:
        """
        Retrieve messages.
        If branch_id is provided, filters messages by that branch's key.
        Orders by received_at desc.
        """
        statement = select(self.model)

        if branch_id is not None:
            # Get the slug for the given branch_id
            branch = db.get(BranchSetting, branch_id)
            if branch:
                statement = statement.where(self.model.branch_key == branch.slug)
            else:
                # If branch_id is given but not found, return empty list
                return [] 

        statement = statement.order_by(self.model.received_at.desc()).offset(skip).limit(limit)
        
        results = db.execute(statement)
        return results.scalars().all()

# Create an instance
message = CRUDMessage(Message)

# Below functions might be redundant if using the CRUD class instance
# def get_message(db: Session, message_id: int) -> Optional[Message]:
#     return db.get(Message, message_id)

# def create_message(db: Session, *, message_in: MessageCreate) -> Message:
#     """Creates a new message."""
#     db_message = Message.model_validate(message_in) # Pydantic V2
#     # db_message = Message.from_orm(message_in) # Pydantic V1
#     db.add(db_message)
#     db.commit()
#     db.refresh(db_message)
#     return db_message

# No update/delete for general messages usually 
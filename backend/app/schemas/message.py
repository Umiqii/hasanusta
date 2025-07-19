from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from datetime import datetime

# Shared properties
class MessageBase(BaseModel):
    name: str = Field(..., example="Fatma Demir")
    email: EmailStr = Field(..., example="fatma.demir@example.com")
    phone: Optional[str] = Field(default=None, example="+905551112233")
    subject: Optional[str] = Field(default=None, example="Öneri")
    message: str = Field(..., example="Menünüze vejetaryen seçenekler eklemelisiniz.")
    branch_key: str = Field(..., example="kurttepe")

# Properties to receive via API on creation
class MessageCreate(MessageBase):
    pass

# Properties shared by models stored in DB
class MessageInDBBase(MessageBase):
    id: int
    received_at: datetime

    class Config:
        orm_mode = True # Pydantic V1 style, use from_attributes=True for V2

# Properties to return to client
class MessageRead(MessageInDBBase):
    pass

# Properties stored in DB
class MessageInDB(MessageInDBBase):
    pass 
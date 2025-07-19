from pydantic import BaseModel, EmailStr, Field
from typing import Optional

# Shared properties
class UserBase(BaseModel):
    email: EmailStr = Field(..., example="admin@example.com")
    username: str = Field(..., example="admin_user")
    is_active: Optional[bool] = True
    is_superuser: bool = False
    branch_id: Optional[int] = Field(default=None, example=1)

# Properties to receive via API on creation
class UserCreate(UserBase):
    password: str = Field(..., min_length=8, example="strongpassword123")

# Properties to receive via API on update
class UserUpdate(BaseModel):
    email: Optional[EmailStr] = Field(default=None, example="new_admin@example.com")
    username: Optional[str] = Field(default=None, example="new_admin_user")
    password: Optional[str] = Field(default=None, min_length=8, example="newstrongpassword123")
    is_active: Optional[bool] = None
    is_superuser: Optional[bool] = None
    branch_id: Optional[int] = None

# Properties shared by models stored in DB
class UserInDBBase(UserBase):
    id: int

    class Config:
        orm_mode = True # Pydantic V1 style, use from_attributes=True for V2

# Properties to return to client
class UserRead(UserInDBBase):
    # Add related Branch info if needed later
    # branch: Optional[BranchSettingRead] = None
    pass

# Properties stored in DB
class UserInDB(UserInDBBase):
    hashed_password: str 
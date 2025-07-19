from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from datetime import date, datetime

# Shared properties
class ApplicationBase(BaseModel):
    name: str = Field(..., example="Ayşe Kaya")
    email: EmailStr = Field(..., example="ayse.kaya@example.com")
    phone: str = Field(..., example="+905429876543")
    birthdate: date = Field(..., example="1998-05-15")
    branch_key: str = Field(..., example="branchKurttepe") # From frontend
    department: str = Field(..., example="Garson")
    experience_years: int = Field(..., example=3, ge=0)
    message: Optional[str] = Field(default=None, example="Ekibinizle çalışmayı çok isterim.")
    privacy_policy_accepted: bool = Field(..., example=True)

# Properties to receive via API on creation
# Note: CV file is handled separately as UploadFile in the endpoint
class ApplicationCreate(ApplicationBase):
    pass

# Properties shared by models stored in DB
class ApplicationInDBBase(ApplicationBase):
    id: int
    cv_file_path: str # Stored after file upload
    submitted_at: datetime

    class Config:
        orm_mode = True # Pydantic V1 style, use from_attributes=True for V2

# Properties to return to client (including CV path)
class ApplicationRead(ApplicationInDBBase):
    pass

# Properties stored in DB
class ApplicationInDB(ApplicationInDBBase):
    pass 
from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from datetime import date, time, datetime
from app.models.models import ReservationStatus # Import Enum from models

# Shared properties
class ReservationBase(BaseModel):
    name: str = Field(..., example="Ahmet Yılmaz")
    email: EmailStr = Field(..., example="ahmet.yilmaz@example.com")
    phone: str = Field(..., example="+905321234567")
    reservation_date: date = Field(..., example="2024-12-31")
    reservation_time: time = Field(..., example="19:30:00")
    guest_count: int = Field(..., example=4, gt=0) # Ensure guest count is positive
    branch_key: str = Field(..., example="branchKurttepe") # From frontend
    message: Optional[str] = Field(default=None, example="Pencere kenarı lütfen.")
    consent: bool = Field(..., example=True)

# Properties to receive via API on creation
class ReservationCreate(ReservationBase):
    pass

# Properties to receive via API on update (only status)
class ReservationUpdate(BaseModel):
    status: ReservationStatus = Field(..., example=ReservationStatus.CONFIRMED)

# Properties shared by models stored in DB
class ReservationInDBBase(ReservationBase):
    id: int
    status: ReservationStatus
    received_at: datetime

    class Config:
        orm_mode = True # Pydantic V1 style, use from_attributes=True for V2

# Properties to return to client
class ReservationRead(ReservationInDBBase):
    pass

# Properties stored in DB
class ReservationInDB(ReservationInDBBase):
    pass 
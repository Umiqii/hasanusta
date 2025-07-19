from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

# Shared properties
class BranchSettingBase(BaseModel):
    name: str = Field(..., example="Kurttepe Şubesi")
    slug: str = Field(..., example="kurttepe")
    display_whatsapp_number: Optional[str] = Field(default=None, example="+905551234567")
    default_links: Dict[str, Any] = Field(..., example={"order": "https://example.com/order", "feedback": "https://example.com/feedback"})
    link_order: List[str] = Field(..., example=["order", "feedback"])

# Properties to receive via API on creation
class BranchSettingCreate(BranchSettingBase):
    pass

# Properties to receive via API on update
class BranchSettingUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None # Generally slugs should not be updated easily
    display_whatsapp_number: Optional[str] = None
    default_links: Optional[Dict[str, Any]] = None
    link_order: Optional[List[str]] = None

# Properties shared by models stored in DB
class BranchSettingInDBBase(BranchSettingBase):
    id: int

    class Config:
        orm_mode = True # Pydantic V1 style, use from_attributes=True for V2

# Properties to return to client
class BranchSettingRead(BranchSettingInDBBase):
    pass

# Properties stored in DB
class BranchSettingInDB(BranchSettingInDBBase):
    pass 
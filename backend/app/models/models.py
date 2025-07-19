from sqlmodel import SQLModel, Field, Relationship, JSON, Column
from typing import List, Optional, Dict, Any
from datetime import date, time, datetime
import enum

# Forward references for relationships
class BranchSetting(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    slug: str = Field(unique=True, index=True)
    display_whatsapp_number: Optional[str] = Field(default=None)
    default_links: Dict[str, Any] = Field(sa_column=Column(JSON))
    link_order: List[str] = Field(sa_column=Column(JSON))

    users: List["User"] = Relationship(back_populates="branch")
    managed_tables: List["ManagedTable"] = Relationship(back_populates="branch")

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(index=True, unique=True)
    email: str = Field(unique=True, index=True)
    hashed_password: str
    is_active: bool = Field(default=True)
    is_superuser: bool = Field(default=False)

    branch_id: Optional[int] = Field(default=None, foreign_key="branchsetting.id")
    branch: Optional[BranchSetting] = Relationship(back_populates="users")

class ManagedTable(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    table_number: int = Field(index=True)
    link: str # Generated/updated based on override or default structure
    override_main_qr_link: Optional[str] = Field(default=None)
    overridden_links: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))

    branch_id: int = Field(foreign_key="branchsetting.id")
    branch: BranchSetting = Relationship(back_populates="managed_tables")

    # Add unique constraint for table_number within a branch?
    # __table_args__ = (UniqueConstraint("table_number", "branch_id", name="_table_branch_uc"),)

class ReservationStatus(str, enum.Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"

class Reservation(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    email: str = Field(index=True)
    phone: str
    reservation_date: date
    reservation_time: time
    guest_count: int
    branch_key: str # Needs mapping to BranchSetting.slug
    message: Optional[str] = Field(default=None)
    consent: bool
    status: ReservationStatus = Field(default=ReservationStatus.PENDING)
    received_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

class Application(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    email: str = Field(index=True)
    phone: str
    birthdate: date
    branch_key: str # Needs mapping to BranchSetting.slug
    department: str
    experience_years: int
    message: Optional[str] = Field(default=None)
    privacy_policy_accepted: bool
    cv_file_path: str # Path on server or storage URL
    submitted_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

class Message(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    email: str = Field(index=True)
    phone: Optional[str] = Field(default=None)
    subject: Optional[str] = Field(default=None)
    message: str
    branch_key: str = Field(index=True)
    received_at: datetime = Field(default_factory=datetime.utcnow, nullable=False) 
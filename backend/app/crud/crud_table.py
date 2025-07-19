from typing import Any, Dict, Optional, Union, List

from sqlmodel import Session, select
from sqlalchemy.orm import joinedload

from app.crud.base import CRUDBase
from app.models.models import ManagedTable, BranchSetting
from app.schemas.table import ManagedTableCreate, ManagedTableUpdate, ManagedTableBulkCreate
from app.core.config import settings

# Import branch CRUD
from .crud_branch import branch as crud_branch

class CRUDManagedTable(CRUDBase[ManagedTable, ManagedTableCreate, ManagedTableUpdate]):

    def generate_default_table_link(self, branch_slug: str, table_number: int) -> str:
        """Generates the default QR code link for a table using the new URL structure."""
        # Ensure BASE_URL is the frontend URL (e.g., https://positive-tranquility-production.up.railway.app)
        base_url = settings.BASE_URL.rstrip('/') 
        # Use the new path structure
        return f"{base_url}/musteri/sube/{branch_slug}/table/{table_number}"

    def get_by_number_and_branch(
        self, db: Session, *, table_number: int, branch_id: int
    ) -> Optional[ManagedTable]:
        statement = select(self.model).where(
            self.model.table_number == table_number,
            self.model.branch_id == branch_id
        )
        return db.execute(statement).scalars().first()

    def get_multi_by_branch(
        self, db: Session, *, branch_id: Optional[int], skip: int = 0, limit: int = 100
    ) -> List[ManagedTable]:
        """Get tables for a specific branch (or all if branch_id is None - for superuser)."""
        statement = select(self.model)
        if branch_id is not None:
            statement = statement.where(self.model.branch_id == branch_id)
        statement = statement.order_by(self.model.table_number).offset(skip).limit(limit)
        results = db.execute(statement)
        return results.scalars().all()

    def create_bulk(
        self, db: Session, *, tables_in: ManagedTableBulkCreate, branch: BranchSetting
    ) -> List[ManagedTable]:
        """Creates tables in bulk for a given branch."""
        created_tables = []
        for table_num in range(tables_in.start_number, tables_in.end_number + 1):
            existing = self.get_by_number_and_branch(db, table_number=table_num, branch_id=branch.id)
            if not existing:
                link = self.generate_default_table_link(branch_slug=branch.slug, table_number=table_num)
                db_table = self.model(
                    table_number=table_num,
                    branch_id=branch.id,
                    link=link,
                )
                db.add(db_table)
                created_tables.append(db_table)
        db.commit()
        for table_obj in created_tables:
            db.refresh(table_obj)
        return created_tables

    def update_with_link_regen(
        self, db: Session, *, db_obj: ManagedTable, obj_in: ManagedTableUpdate, branch_slug: str
    ) -> ManagedTable:
        """Updates a table, regenerating link if needed."""
        # Use base update method first
        db_obj = super().update(db, db_obj=db_obj, obj_in=obj_in)
        
        # Regenerate link based on potential override update
        new_link = db_obj.override_main_qr_link or self.generate_default_table_link(
            branch_slug=branch_slug, table_number=db_obj.table_number
        )
        if db_obj.link != new_link:
             db_obj.link = new_link
             db.add(db_obj) # Add again to mark as dirty
             db.commit()
             db.refresh(db_obj)
        return db_obj

    def remove_bulk(self, db: Session, *, table_ids: List[int], branch_id: int) -> int:
        """Removes tables by IDs, ensuring they belong to the correct branch. Returns count."""
        statement = select(self.model).where(
            self.model.id.in_(table_ids),
            self.model.branch_id == branch_id
        )
        tables_to_delete = db.execute(statement).scalars().all()
        count = 0
        for table_obj in tables_to_delete:
            db.delete(table_obj)
            count += 1
        db.commit()
        return count

# Create an instance
table = CRUDManagedTable(ManagedTable) 
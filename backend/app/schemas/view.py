from pydantic import BaseModel
from typing import List, Optional

# Represents a single link item shown to the customer
class LinkItem(BaseModel):
    key: str  # e.g., "order", "instagram", "feedback"
    label: str # e.g., "Sipariş Ver", "Instagram", "Geri Bildirim"
    icon: Optional[str] = None # e.g., "icons8-buy-100.png"
    url: str

# Data structure returned for the table customer view endpoint
class TableCustomerViewData(BaseModel):
    ordered_links: List[LinkItem] # Links sorted and overridden for the specific table
    display_whatsapp_number: Optional[str] = None # Added WhatsApp number field 
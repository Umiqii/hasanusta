from typing import Any, List, Dict

from fastapi import APIRouter, Depends, HTTPException, Path
from sqlmodel import Session

from app import crud, models, schemas
from app.api import deps # For get_db
from app.core.config import settings # For BASE_URL, maybe link labels/icons

# Define link labels and icons based on frontend/src/pages/admin/BranchSettings.tsx
LINK_CONFIG = {
    "order":          {"label": "Bir Tıkla Sipariş Ver!", "icon": "icons8-buy-48.png"},
    "feedback":       {"label": "Yorum Bırak",           "icon": "icons8-review-50.png"},
    "instagram":      {"label": "Instagram",             "icon": "icons8-instagram-48.png"},
    "whatsapp":       {"label": "WhatsApp",              "icon": "icons8-whatsapp-48.png"},
    "branchIstanbul": {"label": "İstanbul Şubemiz",      "icon": "icons8-location-50.png"},
    "branchAnkara":   {"label": "Ankara Şubemiz",        "icon": "icons8-location-50.png"},
    "branchKurttepe": {"label": "Kurttepe Şubemiz",      "icon": "icons8-location-50.png"},
    "branchBarajyolu":{"label": "Barajyolu Şubemiz",     "icon": "icons8-location-50.png"},
    "threads":        {"label": "Threads",               "icon": "icons8-threads-50.png"},
    "twitter":        {"label": "Twitter",               "icon": "icons8-twitter-50.png"},
    "tiktok":         {"label": "TikTok",                "icon": "icons8-tiktok-50.png"},
    # Fallback (should not be needed if branch.link_order is clean)
    "default":        {"label": "Website",               "icon": "icons8-location-50.png"} 
}

router = APIRouter()

@router.get("/sube/{branch_slug}/table/{table_number}", response_model=schemas.TableCustomerViewData)
def get_table_customer_view(
    *, 
    db: Session = Depends(deps.get_db),
    branch_slug: str = Path(..., description="Slug of the branch"),
    table_number: int = Path(..., description="Table number", gt=0)
) -> Any:
    """
    Retrieve data needed for the customer view of a specific table.
    Public access.
    """
    # 1. Find BranchSetting by slug
    branch = crud.branch.get_by_slug(db, slug=branch_slug)
    if not branch:
        raise HTTPException(status_code=404, detail="Branch not found")

    # 2. Find ManagedTable by table_number and branch_id
    table = crud.table.get_by_number_and_branch(
        db, table_number=table_number, branch_id=branch.id
    )
    if not table:
        raise HTTPException(status_code=404, detail="Table not found in this branch")

    # 3. Calculate effective links
    # Start with default branch links
    effective_links = branch.default_links.copy()
    # Override with table-specific links if they exist
    if table.overridden_links:
        effective_links.update(table.overridden_links)
        
    # 4. Order and format links based on branch.link_order
    ordered_link_items: List[schemas.LinkItem] = []
    processed_keys = set()

    for key in branch.link_order:
        if key in effective_links:
            url = effective_links[key]
            config = LINK_CONFIG.get(key, LINK_CONFIG["default"])
            ordered_link_items.append(schemas.LinkItem(
                key=key,
                label=config["label"],
                icon=config.get("icon"), # Icon is optional
                url=str(url) # Ensure URL is string
            ))
            processed_keys.add(key)
            
    # Add any remaining links from effective_links that were not in link_order (optional)
    # for key, url in effective_links.items():
    #     if key not in processed_keys:
    #         config = LINK_CONFIG.get(key, LINK_CONFIG["default"])
    #         ordered_link_items.append(schemas.LinkItem(
    #             key=key,
    #             label=config["label"],
    #             icon=config.get("icon"),
    #             url=str(url)
    #         ))

    # Determine the main QR link (already generated and stored in table.link)
    main_qr_link = table.link

    # Get the display WhatsApp number from the branch
    whatsapp_number = branch.display_whatsapp_number

    # Construct the response
    response_data = schemas.TableCustomerViewData(
        ordered_links=ordered_link_items,
        display_whatsapp_number=whatsapp_number
    )

    return response_data 
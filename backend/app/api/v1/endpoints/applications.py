from typing import Any, List
from typing import Optional
import shutil
import os
from pathlib import Path
from datetime import datetime # Need datetime for filename

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlmodel import Session

from app import crud, models, schemas
from app.api import deps
from app.core.config import settings

# Define a directory to store CVs (consider security and volume mapping in Docker)
# Ensure this path is accessible within the container and ideally mapped to a persistent volume
UPLOAD_DIRECTORY = Path("/app/uploads/cv")
UPLOAD_DIRECTORY.mkdir(parents=True, exist_ok=True)

router = APIRouter()


# POST endpoint is public, handles file upload
@router.post("/", response_model=schemas.ApplicationRead, status_code=status.HTTP_201_CREATED)
def create_application(
    *, # Keyword-only arguments
    db: Session = Depends(deps.get_db),
    # Receive form data using Form()
    name: str = Form(...),
    email: str = Form(...),
    phone: str = Form(...),
    birthdate: str = Form(...), # Receive as string, Pydantic will parse to date
    branch_key: str = Form(...),
    department: str = Form(...),
    experience_years: int = Form(...),
    message: Optional[str] = Form(None),
    privacy_policy_accepted: bool = Form(...),
    cv_file: UploadFile = File(...),
) -> Any:
    """
    Create new application. Public access.
    Handles CV file upload.
    """
    # Basic validation for file type (optional but recommended)
    if cv_file.content_type not in ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]:
        raise HTTPException(status_code=400, detail="Invalid file type. Only PDF and Word documents are allowed.")

    # Basic validation for file size (optional but recommended)
    MAX_FILE_SIZE = 5 * 1024 * 1024 # 5 MB
    size = cv_file.size
    if size > MAX_FILE_SIZE:
         raise HTTPException(status_code=413, detail="File size exceeds the limit of 5MB.")

    # Create the ApplicationCreate schema from form data
    application_in = schemas.ApplicationCreate(
        name=name, email=email, phone=phone, birthdate=birthdate, 
        branch_key=branch_key, department=department, 
        experience_years=experience_years, message=message, 
        privacy_policy_accepted=privacy_policy_accepted
    )

    # Sanitize filename and create a unique path
    # Avoid using user-provided filename directly
    file_extension = Path(cv_file.filename).suffix
    # Create a more robust unique naming convention (e.g., using UUID)
    # For simplicity, using email and timestamp here (ensure email is valid first)
    safe_email = application_in.email.replace("@", "_").replace(".", "_")
    unique_filename = f"{safe_email}_{int(datetime.now().timestamp())}{file_extension}"
    file_path = UPLOAD_DIRECTORY / unique_filename

    # Save the file
    try:
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(cv_file.file, buffer)
    except Exception as e:
        # Log the error
        print(f"Error saving file: {e}")
        raise HTTPException(status_code=500, detail="Could not save CV file.")
    finally:
        cv_file.file.close() # Ensure the file is closed

    # Create application entry in DB
    application_obj = crud.application.create_with_cv_path(
        db=db, obj_in=application_in, cv_file_path=str(file_path)
    )
    
    if not application_obj:
        # Clean up saved file if DB entry fails
        if file_path.exists():
            file_path.unlink()
        raise HTTPException(
            status_code=400,
            detail="Invalid branch key provided.",
        )

    return application_obj

# GET endpoint requires authentication and filters by user's branch
@router.get("/", response_model=List[schemas.ApplicationRead])
def read_applications(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve applications for the user's branch (or all for superuser).
    Requires authentication.
    """
    user_branch_id = None if current_user.is_superuser else current_user.branch_id
    applications = crud.application.get_multi_by_branch(
        db, branch_id=user_branch_id, skip=skip, limit=limit
    )
    return applications

# GET endpoint to download CV requires authentication and checks ownership
@router.get("/cv/{application_id}")#, response_class=FileResponse)
def download_cv(
    *, # Keyword-only arguments
    db: Session = Depends(deps.get_db),
    application_id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Download the CV file for a specific application.
    Requires authentication and ensures the user has access to the application's branch.
    """
    db_application = crud.application.get(db, id=application_id)
    if not db_application:
        raise HTTPException(status_code=404, detail="Application not found")

    # Authorization check
    if not current_user.is_superuser:
        if not current_user.branch_id:
             raise HTTPException(status_code=403, detail="User is not assigned to a branch")
        # Check if application's branch_key matches user's branch slug
        branch = crud.branch.get(db, id=current_user.branch_id)
        if not branch or db_application.branch_key != branch.slug:
            raise HTTPException(status_code=403, detail="Not authorized to access this CV")

    cv_path = Path(db_application.cv_file_path)
    if not cv_path.is_file():
        # Log this error - indicates missing file or incorrect path in DB
        print(f"CV file not found at path: {cv_path}")
        raise HTTPException(status_code=404, detail="CV file not found on server")

    # Return file response
    # Use filename from the path, or generate a more user-friendly one
    return FileResponse(path=cv_path, filename=cv_path.name, media_type='application/octet-stream') 
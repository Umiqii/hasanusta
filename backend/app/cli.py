import argparse
import getpass
import sys
import logging

from sqlalchemy.orm import Session
from pydantic import ValidationError, EmailStr, BaseModel # Keep BaseModel for potential validation

from app.db.session import SessionLocal
from app.core.security import get_password_hash
from app.models.models import User, BranchSetting
from app import crud
from app.schemas.user import UserCreate

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def create_user_directly(
    db: Session,
    email: str,
    password: str,
    username: str,
    is_superuser: bool,
    branch_slug: str | None
):
    """
    Core logic to create a user, separated from argument parsing.
    """
    try:
        # --- Basic Email Validation (Optional but recommended) ---
        class EmailModel(BaseModel):
            email_field: EmailStr
        try:
            EmailModel(email_field=email)
        except ValidationError:
            logger.error(f"Invalid email format: {email}")
            return # Exit function on validation error

        # --- Check if user exists ---
        logger.info(f"Checking for existing user: {email} / {username}")
        user_in_db_email = crud.user.get_by_email(db, email=email)
        if user_in_db_email:
            logger.error(f"User with email {email} already exists.")
            return
        user_in_db_username = crud.user.get_by_username(db, username=username)
        if user_in_db_username:
            logger.error(f"User with username {username} already exists.")
            return
        logger.info("User existence check passed.")

        # --- Handle Branch --- 
        branch_id: int | None = None
        if not is_superuser:
            if not branch_slug:
                logger.error("Branch slug is required for non-superusers.")
                return
            logger.info(f"Looking for branch: {branch_slug}")
            branch = crud.branch.get_by_slug(db, slug=branch_slug)
            if not branch:
                logger.error(f"Branch with slug '{branch_slug}' not found.")
                return
            branch_id = branch.id
            logger.info(f"Branch found with ID: {branch_id}")
        elif branch_slug:
            logger.info(f"Superuser: Looking for branch: {branch_slug}")
            branch = crud.branch.get_by_slug(db, slug=branch_slug)
            if branch:
                branch_id = branch.id
                logger.info(f"Superuser assigned to branch ID: {branch_id}")
            else:
                logger.warning(f"Branch slug '{branch_slug}' provided for superuser but not found. Assigning NULL.")

        # --- Create User via CRUD --- 
        logger.info("Preparing user data for creation (using plain 'password' key)...")
        user_in = UserCreate(
            email=email,
            username=username,
            password=password,
            is_superuser=is_superuser,
            branch_id=branch_id,
            is_active=True
        )
        logger.info("User data prepared.")

        logger.info("Attempting to create user in DB using crud.user.create...")
        user = crud.user.create(db=db, obj_in=user_in)
        logger.info(f"User '{username}' ({email}) created successfully.")
        if is_superuser:
            logger.info("User is a SUPERUSER.")
        if branch_id:
            logger.info(f"User assigned to branch ID: {branch_id} (Slug: {branch_slug})")

    except Exception as e:
        exc_type, exc_value, _ = sys.exc_info()
        logger.error(f"An unexpected error occurred during user creation: {e}", exc_info=True)
        logger.error(f"Error Type: {exc_type}")
        logger.error(f"Error Value: {exc_value}")
        db.rollback() # Rollback on any error during the process


def main():
    parser = argparse.ArgumentParser(description="Create a new user.")
    parser.add_argument("--email", required=True, help="User's email address.")
    parser.add_argument("--username", required=True, help="User's username.")
    parser.add_argument("--superuser", action="store_true", help="Set user as superuser.")
    parser.add_argument("--branch-slug", help="Slug of the branch (required for non-superusers).")

    args = parser.parse_args()

    # Get password securely
    password = getpass.getpass("Password: ")
    password_confirmation = getpass.getpass("Repeat for confirmation: ")

    if password != password_confirmation:
        print("Error: The two entered passwords do not match.", file=sys.stderr)
        sys.exit(1)

    # Basic check for non-superuser branch slug
    if not args.superuser and not args.branch_slug:
         print("Error: --branch-slug is required for non-superusers.", file=sys.stderr)
         sys.exit(1)

    db: Session | None = None
    try:
        logger.info("Attempting to create database session...")
        db = SessionLocal()
        logger.info("Database session created.")
        # Call the core user creation logic
        create_user_directly(
            db=db,
            email=args.email,
            password=password,
            username=args.username,
            is_superuser=args.superuser,
            branch_slug=args.branch_slug
        )
    except Exception as e:
        logger.error(f"Failed to connect to DB or run script: {e}", exc_info=True)
        if db: # Rollback if session was created before error
            db.rollback()
        sys.exit(1)
    finally:
        if db:
            logger.info("Closing database session.")
            db.close()

if __name__ == "__main__":
    main() 
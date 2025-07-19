from fastapi import APIRouter

# Import endpoint routers here
from .endpoints import auth, users, branches, tables, reservations, applications, messages, view

api_router = APIRouter()

# --- Authentication and User Routes ---
api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])
# User routes might need separate handling if some are admin-only
api_router.include_router(users.router, prefix="/users", tags=["Users"]) 

# --- Admin Routes (for GET, PATCH, DELETE etc. requiring auth) ---
admin_router = APIRouter()
admin_router.include_router(branches.router, prefix="/settings/branches", tags=["Branch Settings (Admin)"])
admin_router.include_router(tables.router, prefix="/tables", tags=["Table Management (Admin)"])
# Include routers under /admin for admin-specific operations (GET list, PATCH status etc.)
admin_router.include_router(reservations.router, prefix="/reservations", tags=["Reservations (Admin)"])
admin_router.include_router(applications.router, prefix="/applications", tags=["Applications (Admin)"])
admin_router.include_router(messages.router, prefix="/messages", tags=["Messages (Admin)"])

# Include the admin router under the /admin prefix
api_router.include_router(admin_router, prefix="/admin")

# --- Public Routes (specifically for POST operations) ---
# Include the same routers directly under /api/v1 for public POST endpoints
# Assumes the endpoint functions themselves might handle auth based on method or path
api_router.include_router(reservations.router, prefix="/reservations", tags=["Reservations (Public)"])
api_router.include_router(applications.router, prefix="/applications", tags=["Applications (Public)"])
api_router.include_router(messages.router, prefix="/messages", tags=["Messages (Public)"])

# Customer view endpoint (Public)
api_router.include_router(view.router, prefix="/musteri", tags=["Müşteri Görünümü"]) 
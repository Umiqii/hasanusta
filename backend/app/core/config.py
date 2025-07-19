from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List, Optional
from functools import lru_cache

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file='.env', env_file_encoding='utf-8', extra='ignore')

    # Database
    DATABASE_URL: str

    # JWT
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # API
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Adana Ustam Backend"

    # CORS
    BACKEND_CORS_ORIGINS: str = "*" # Comma-separated string

    # Base URL
    BASE_URL: str = "http://localhost:8000"

@lru_cache
def get_settings() -> Settings:
    return Settings()

settings = get_settings() 
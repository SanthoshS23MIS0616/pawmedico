from pathlib import Path

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    app_name: str = "PawMedic Pro API"
    api_v1_prefix: str = "/api/v1"
    environment: str = "development"
    google_api_key: str | None = None
    gemini_model: str = "gemini-1.5-pro"
    gemini_confidence_threshold: float = 60.0
    supabase_url: str | None = None
    supabase_anon_key: str | None = None
    supabase_service_role_key: str | None = None
    allowed_origins: list[str] = ["http://localhost:5173", "http://127.0.0.1:5173"]
    default_rate_limit: str = "60/minute"
    model_config = SettingsConfigDict(
        env_file=BASE_DIR / ".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    @field_validator("allowed_origins", mode="before")
    @classmethod
    def split_origins(cls, value: str | list[str]) -> list[str]:
        if isinstance(value, str):
            return [item.strip() for item in value.split(",") if item.strip()]
        return value

    @property
    def upload_dir(self) -> Path:
        return BASE_DIR / "app" / "assets" / "uploads"

    @property
    def model_dir(self) -> Path:
        return BASE_DIR / "app" / "models"

    @property
    def data_dir(self) -> Path:
        return BASE_DIR / "app" / "data"


settings = Settings()

from pathlib import Path

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
    allowed_origins: str = "http://localhost:5173,http://127.0.0.1:5173"
    default_rate_limit: str = "60/minute"
    model_config = SettingsConfigDict(
        env_file=BASE_DIR / ".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    @property
    def upload_dir(self) -> Path:
        return BASE_DIR / "app" / "assets" / "uploads"

    @property
    def model_dir(self) -> Path:
        return BASE_DIR / "app" / "models"

    @property
    def data_dir(self) -> Path:
        return BASE_DIR / "app" / "data"

    @property
    def cors_origins(self) -> list[str]:
        return [item.strip() for item in self.allowed_origins.split(",") if item.strip()]


settings = Settings()

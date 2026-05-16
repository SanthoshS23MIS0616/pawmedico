from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    app_name: str = "PetMedico API"
    api_v1_prefix: str = "/api/v1"
    environment: str = "development"
    groq_api_key: str | None = None
    groq_text_model: str = "llama-3.3-70b-versatile"
    groq_vision_model: str = "meta-llama/llama-4-scout-17b-16e-instruct"
    ai_confidence_threshold: float = 60.0
    supabase_url: str | None = None
    supabase_anon_key: str | None = None
    supabase_service_role_key: str | None = None
    supabase_storage_bucket: str = "pet-photos"
    allowed_origins: str = "http://localhost:5173,http://127.0.0.1:5173"
    public_api_url: str | None = None
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

    @property
    def supabase_auth_enabled(self) -> bool:
        return bool(self.supabase_url and self.supabase_anon_key)

    @property
    def supabase_admin_enabled(self) -> bool:
        return bool(self.supabase_url and self.supabase_service_role_key)

    @property
    def supabase_storage_enabled(self) -> bool:
        return self.supabase_auth_enabled and bool(self.supabase_storage_bucket)

settings = Settings()

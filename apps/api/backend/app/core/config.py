from functools import lru_cache
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

_API_ROOT = Path(__file__).parent.parent.parent.parent  # apps/api/


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(_API_ROOT / ".env"),
        extra="ignore",
    )
    app_name: str = "NexPod API"
    database_url: str | None = None  # reads DATABASE_URL from .env
    cors_origins: str = "http://localhost:3000"
    simulation_tick_seconds: int = 5
    gemini_api_key: str | None = None
    gemini_model: str = "gemini-2.5-flash"
    grok_api_key: str | None = None
    grok_model: str = "llama-3.3-70b-versatile"

    @property
    def origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()

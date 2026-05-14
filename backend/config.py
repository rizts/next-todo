from pydantic_settings import BaseSettings
from pydantic import field_validator


class Settings(BaseSettings):
    BETTER_AUTH_SECRET: str
    FRONTEND_URL: str = "http://localhost:3000"
    DATABASE_URL: str = "sqlite:///./todos.db"

    @field_validator("FRONTEND_URL", mode="before")
    @classmethod
    def strip_trailing_slash(cls, v: str) -> str:
        if isinstance(v, str):
            return v.rstrip("/")
        return v

    class Config:
        env_file = ".env"


settings = Settings()

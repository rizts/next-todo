from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    BETTER_AUTH_SECRET: str
    FRONTEND_URL: str = "http://localhost:3000"
    DATABASE_URL: str = "sqlite:///./todos.db"

    class Config:
        env_file = ".env"


settings = Settings()

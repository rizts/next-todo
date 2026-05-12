import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from jose import jwt
import os

from database import Base, get_db
from main import app
from config import settings

# Gunakan database in-memory untuk testing
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_todos.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="function")
def db():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="module")
def auth_headers():
    """Helper to create a valid JWT header for testing."""
    payload = {"sub": "test_user_123"}
    token = jwt.encode(payload, settings.BETTER_AUTH_SECRET, algorithm="HS256")
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture(scope="function")
def client(db):
    """Override get_db dependency to use the test database."""
    def override_get_db():
        try:
            yield db
        finally:
            pass
            
    app.dependency_overrides[get_db] = override_get_db
    from fastapi.testclient import TestClient
    yield TestClient(app)
    app.dependency_overrides.clear()

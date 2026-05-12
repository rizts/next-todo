import pytest
import jwt
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os
from unittest.mock import patch

from database import Base, get_db
from main import app
from config import settings

# Gunakan database in-memory untuk testing
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_todos.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Kunci Privat/Publik palsu untuk testing (EdDSA/Ed25519)
# Kita pakai RS256 saja untuk mempermudah generate key di test tanpa library tambahan jika EdDSA sulit
# Tapi PyJWT bisa handle EdDSA jika cryptography ada.
# Mari gunakan HS256 saja di test tapi dengan 'kid' agar logic backend tetap jalan.
TEST_KID = "test_kid_123"
TEST_SECRET = "test_secret_for_unit_tests_only"

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
    """Helper to create a valid JWT header for testing with a KID."""
    payload = {"sub": "test_user_123"}
    token = jwt.encode(
        payload, 
        TEST_SECRET, 
        algorithm="HS256", 
        headers={"kid": TEST_KID}
    )
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture(scope="function", autouse=True)
def mock_jwks():
    """Mock the get_jwks call in auth.py to return our test key."""
    mock_data = {
        "keys": [
            {
                "kty": "oct", # Symmetric key in JWK format
                "alg": "HS256",
                "k": "dGVzdF9zZWNyZXRfZm9yX3VuaXRfdGVzdHNfb25seQ", # base64 for TEST_SECRET
                "kid": TEST_KID
            }
        ]
    }
    with patch("auth.get_jwks", return_value=mock_data):
        yield

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

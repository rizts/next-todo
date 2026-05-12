import pytest
from jose import jwt
from config import settings

def test_auth_valid_token(client, auth_headers):
    # Testing the root endpoint or any protected endpoint with valid token
    response = client.get("/todos/", headers=auth_headers)
    assert response.status_code == 200

def test_auth_missing_header(client):
    response = client.get("/todos/")
    assert response.status_code == 401
    assert "Missing or invalid authorization header" in response.json()["detail"]

def test_auth_invalid_token(client):
    headers = {"Authorization": "Bearer invalid-token-here"}
    response = client.get("/todos/", headers=headers)
    assert response.status_code == 401
    assert "Token validation failed" in response.json()["detail"]

def test_auth_wrong_secret(client):
    # Token signed with a different secret
    payload = {"sub": "user123"}
    token = jwt.encode(payload, "wrong_secret_key", algorithm="HS256")
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/todos/", headers=headers)
    assert response.status_code == 401

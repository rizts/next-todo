import pytest
import jwt

def test_create_todo(client, auth_headers):
    response = client.post(
        "/todos/",
        json={"title": "Test my todo"},
        headers=auth_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Test my todo"
    assert data["user_id"] == "test_user_123"
    assert data["completed"] is False

def test_list_todos_isolation(client, auth_headers):
    # Create a todo for test_user_123
    client.post("/todos/", json={"title": "User 1 Todo"}, headers=auth_headers)
    
    # Create another user's token
    payload = {"sub": "other_user_456"}
    import jwt
    from tests.conftest import TEST_SECRET, TEST_KID
    other_token = jwt.encode(
        payload, 
        TEST_SECRET, 
        algorithm="HS256", 
        headers={"kid": TEST_KID}
    )
    other_headers = {"Authorization": f"Bearer {other_token}"}
    
    # Other user should see 0 todos
    response = client.get("/todos/", headers=other_headers)
    assert len(response.json()) == 0
    
    # Original user should see 1 todo
    response = client.get("/todos/", headers=auth_headers)
    assert len(response.json()) == 1

def test_update_todo_ownership(client, auth_headers):
    # Create todo
    resp = client.post("/todos/", json={"title": "Own Todo"}, headers=auth_headers)
    todo_id = resp.json()["id"]
    
    # Update status
    resp = client.patch(f"/todos/{todo_id}", json={"completed": True}, headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json()["completed"] is True
    
    # Try update with other user (403 Forbidden)
    payload = {"sub": "hacker_user"}
    from tests.conftest import TEST_SECRET, TEST_KID
    other_token = jwt.encode(
        payload, 
        TEST_SECRET, 
        algorithm="HS256", 
        headers={"kid": TEST_KID}
    )
    other_headers = {"Authorization": f"Bearer {other_token}"}
    
    resp = client.patch(f"/todos/{todo_id}", json={"completed": False}, headers=other_headers)
    assert resp.status_code == 403
    assert resp.json()["detail"] == "Not authorized to access this todo"

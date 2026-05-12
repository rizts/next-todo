import pytest
from schemas import TodoCreate, TodoResponse
from datetime import datetime

def test_todo_create_schema():
    todo_data = {"title": "Buy groceries"}
    todo = TodoCreate(**todo_data)
    assert todo.title == "Buy groceries"

def test_todo_response_schema():
    now = datetime.now()
    todo_data = {
        "id": 1,
        "title": "Test todo",
        "completed": False,
        "user_id": "user_123",
        "created_at": now
    }
    todo = TodoResponse(**todo_data)
    assert todo.id == 1
    assert todo.completed is False
    assert todo.user_id == "user_123"

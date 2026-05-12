from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from auth import get_current_user
import models
import schemas

router = APIRouter(prefix="/todos", tags=["todos"])

@router.get("/", response_model=List[schemas.TodoResponse])
def list_todos(
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user)
):
    """List all todos for the authenticated user."""
    return db.query(models.Todo).filter(models.Todo.user_id == user_id).all()

@router.post("/", response_model=schemas.TodoResponse)
def create_todo(
    todo: schemas.TodoCreate,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user)
):
    """Create a new todo for the authenticated user."""
    db_todo = models.Todo(
        title=todo.title,
        user_id=user_id,
        completed=False
    )
    db.add(db_todo)
    db.commit()
    db.refresh(db_todo)
    return db_todo

@router.patch("/{todo_id}", response_model=schemas.TodoResponse)
def update_todo(
    todo_id: int,
    todo_update: schemas.TodoUpdate,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user)
):
    """Update a todo (e.g., mark as complete). Enforces ownership."""
    db_todo = db.query(models.Todo).filter(models.Todo.id == todo_id).first()
    
    if not db_todo:
        raise HTTPException(status_code=404, detail="Todo not found")
        
    if db_todo.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to access this todo")
        
    db_todo.completed = todo_update.completed
    db.commit()
    db.refresh(db_todo)
    return db_todo

@router.delete("/{todo_id}")
def delete_todo(
    todo_id: int,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user)
):
    """Delete a todo. Enforces ownership."""
    db_todo = db.query(models.Todo).filter(models.Todo.id == todo_id).first()
    
    if not db_todo:
        raise HTTPException(status_code=404, detail="Todo not found")
        
    if db_todo.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this todo")
        
    db.delete(db_todo)
    db.commit()
    return {"message": "Todo deleted successfully"}

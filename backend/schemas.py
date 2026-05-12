from pydantic import BaseModel
from datetime import datetime

class TodoBase(BaseModel):
    title: str

class TodoCreate(TodoBase):
    pass

class TodoUpdate(BaseModel):
    completed: bool

class TodoResponse(TodoBase):
    id: int
    completed: bool
    user_id: str
    created_at: datetime

    class Config:
        from_attributes = True

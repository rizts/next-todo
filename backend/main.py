from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import settings
from routers import todos

app = FastAPI(title="Todo API", description="API for Full-Stack Todo App")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(todos.router)

@app.get("/")
def read_root():
    return {"message": "Todo API is running"}

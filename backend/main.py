from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import settings
from routers import todos

app = FastAPI(title="Todo API", description="API for Full-Stack Todo App")

# Split FRONTEND_URL by comma to support multiple origins (e.g. localhost and Vercel)
origins = [origin.strip() for origin in settings.FRONTEND_URL.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(todos.router)

@app.get("/")
def read_root():
    return {"message": "Todo API is running"}

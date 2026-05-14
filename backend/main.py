from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import settings
from routers import todos

app = FastAPI(title="Todo API", description="API for Full-Stack Todo App")

# Robust parsing of FRONTEND_URL to handle multiple origins, quotes, and trailing slashes
raw_origins = settings.FRONTEND_URL.split(",")
origins = [o.strip().replace('"', '').replace("'", "").rstrip("/") for o in raw_origins if o.strip()]

print(f"DEBUG: Better Auth - Allowed CORS Origins: {origins}")

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

# Todo App — Full-Stack Assignment

A full-stack todo application built with **Next.js 14** (App Router) + **Better Auth** on the frontend and **FastAPI** (Python) on the backend.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| Auth | Better Auth (Google OAuth + Passkey/WebAuthn) |
| Backend | FastAPI (Python 3.11+) |
| Database | SQLite + SQLAlchemy |
| Email | Brevo (transactional) |

## Architecture

```
[Browser]
   │
   ├──► [Next.js Frontend :3000]
   │         │
   │         ├── Better Auth (/api/auth/*)
   │         │     ├── Google OAuth 2.0
   │         │     └── Passkey (WebAuthn)
   │         │
   │         └── Todo UI → REST API calls with JWT
   │
   └──► [FastAPI Backend :8000]
             ├── JWT Middleware (validates Better Auth tokens)
             └── /todos (GET, POST, PATCH, DELETE)
                   └── SQLite DB (per-user isolation)
```

## JWT Integration Decision

Better Auth issues signed JWT tokens after authentication. The Python backend validates these tokens using the **same `BETTER_AUTH_SECRET`** shared between frontend and backend — this avoids needing a separate token exchange endpoint. The backend uses `python-jose` to verify the token signature, extract the user ID, and enforce per-user data isolation.

## Setup

### Prerequisites
- Node.js 18+
- Python 3.11+
- Google Cloud Console project with OAuth credentials

### 1. Frontend

```bash
cd frontend
cp .env.local.example .env.local
# Fill in your credentials in .env.local
npm install
npm run dev
```

### 2. Backend

```bash
cd backend
cp .env.example .env
# Fill in your credentials in .env
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

## Environment Variables

### Frontend (`frontend/.env.local`)

| Variable | Description |
|----------|-------------|
| `BETTER_AUTH_SECRET` | Secret for signing tokens (min 32 chars) |
| `BETTER_AUTH_URL` | Frontend base URL (e.g. `http://localhost:3000`) |
| `GOOGLE_CLIENT_ID` | From Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | From Google Cloud Console |
| `DATABASE_URL` | SQLite path for Better Auth (e.g. `file:./auth.db`) |
| `NEXT_PUBLIC_API_URL` | Backend API URL (e.g. `http://localhost:8000`) |
| `BREVO_API_KEY` | Brevo API key for transactional email |
| `BREVO_SENDER_EMAIL` | Verified sender email in Brevo |

### Backend (`backend/.env`)

| Variable | Description |
|----------|-------------|
| `BETTER_AUTH_SECRET` | Must match frontend secret (for JWT validation) |
| `FRONTEND_URL` | Allowed CORS origin |
| `DATABASE_URL` | SQLite path (e.g. `sqlite:///./todos.db`) |

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a new OAuth 2.0 Client ID (Web application)
3. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
4. Copy Client ID and Secret to `.env.local`

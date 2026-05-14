# 🚀 Full-Stack Todo App (Next.js + FastAPI)

A modern, high-performance Todo application featuring robust authentication with **Better Auth**, a secure **FastAPI** backend, and a beautiful **Next.js** frontend.

> [!NOTE]
> Detailed project documentation, including architecture, features, and deep-dive technical guides, can be found in the **[WALKTHROUGH.md](WALKTHROUGH.md)** file.

## ✨ Features

- **🔐 Secure Authentication**: Integrated with Google OAuth and Passkeys (WebAuthn) via [Better Auth](https://better-auth.com).
- **🛡️ JWT Handshake**: Custom JWT validation middleware in FastAPI using `PyJWT` and asymmetric `JWKS` key rotation.
- **📧 Transactional Emails**: Welcome emails triggered via Brevo API on successful registration.
- **⚡ Fast API**: Backend powered by FastAPI with SQLAlchemy.
- **🗄️ Database Flexibility**: Support for local **SQLite** (development) and **LibSQL/Turso** (production-grade persistence).
- **🎨 Premium UI**: Responsive dashboard built with Tailwind CSS, Lucide icons, and Sonner toast notifications.
- **🧪 Tested**: Comprehensive unit tests for both Frontend (Jest) and Backend (Pytest).

## 🏗️ Architecture

```mermaid
graph TD
    Client[Next.js Frontend] <--> BA[Better Auth Engine]
    BA <--> AuthDB[(LibSQL/SQLite)]
    Client <--> API[FastAPI Backend]
    API <--> TodoDB[(SQLite)]
    BA -- JWT --> API
    BA -- Webhook --> Brevo[Brevo Email API]
```

### Key Technical Decisions

1.  **JWKS (JSON Web Key Set)**: Unlike basic symmetric tokens (HS256), we use asymmetric signing. The frontend serves public keys at `/api/auth/jwks`, which the backend fetches dynamically.
2.  **Serverless Resilience**: To handle the ephemeral nature of serverless platforms (like Vercel), we utilize **LibSQL (Turso)** for authentication data, ensuring sessions are persistent and globally available.
3.  **Robust Config**: The backend includes a global configuration validator to automatically sanitize environment variables (like stripping trailing slashes), ensuring stable connections across different cloud platforms.

## 🛠️ Setup Instructions

### 1. Backend (FastAPI)
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### 2. Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
```

### 3. Environment Variables

Create a `.env.local` in `frontend/`:
```env
# Better Auth
BETTER_AUTH_SECRET=your_secret_here
BETTER_AUTH_URL=http://localhost:3000

# Database (Production: LibSQL/Turso)
DATABASE_URL=libsql://your-db-url
LIBSQL_AUTH_TOKEN=your-auth-token

# OAuth
GOOGLE_CLIENT_ID=your_google_id
GOOGLE_CLIENT_SECRET=your_google_secret

# Email (Brevo)
BREVO_API_KEY=your_brevo_api_key
BREVO_SENDER_EMAIL=your_verified_sender_email
```

Create a `.env` in `backend/`:
```env
FRONTEND_URL=http://localhost:3000
DATABASE_URL=sqlite:///./todo.db
```

## 🧪 Running Tests

### Backend
```bash
cd backend
pytest
```

### Frontend
```bash
cd frontend
npm test
```

## 🐳 Docker Setup
Run the entire stack with:
```bash
docker-compose up --build
```

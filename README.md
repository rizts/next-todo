# 🚀 Full-Stack Todo App (Next.js + FastAPI)

A modern, high-performance Todo application featuring robust authentication with **Better Auth**, a secure **FastAPI** backend, and a beautiful **Next.js** frontend.

## ✨ Features

- **🔐 Secure Authentication**: Integrated with Google OAuth and Passkeys (WebAuthn) via [Better Auth](https://better-auth.com).
- **🛡️ JWT Handshake**: Custom JWT validation middleware in FastAPI using `PyJWT` and asymmetric `JWKS` key rotation.
- **📧 Transactional Emails**: Welcome emails triggered via Brevo API on successful registration (Sender Domain: `mailin.fr` / `yourtodoapp.com`).
- **⚡ Fast API**: Backend powered by FastAPI with SQLite and SQLAlchemy.
- **🎨 Premium UI**: Responsive dashboard built with Tailwind CSS, Lucide icons, and Sonner toast notifications.
- **🧪 Tested**: Comprehensive unit tests for both Frontend (Jest) and Backend (Pytest).

## 🏗️ Architecture

```mermaid
graph TD
    Client[Next.js Frontend] <--> BA[Better Auth Engine]
    BA <--> AuthDB[(auth.db)]
    Client <--> API[FastAPI Backend]
    API <--> TodoDB[(todo.db)]
    BA -- JWT --> API
    BA -- Webhook --> Brevo[Brevo Email API]
```

### Key Technical Decisions

1.  **JWKS (JSON Web Key Set)**: Unlike basic symmetric tokens (HS256), we use asymmetric signing. The frontend serves public keys at `/api/auth/jwks`, which the backend fetches and caches. This allows for seamless key rotation without manual configuration.
2.  **PyJWT Migration**: We migrated from `python-jose` to `PyJWT` to support the `EdDSA` algorithm required by modern authentication standards.
3.  **Better Auth**: Chosen over NextAuth for its superior developer experience, built-in Passkey support, and framework-agnostic core.

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
Create a `.env.local` in `frontend/` and `.env` in `backend/` based on the provided templates.

## 🧪 Running Tests

### Backend
```bash
cd backend
./venv/bin/pytest
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

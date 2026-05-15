# Technical Walkthrough: Full-Stack Todo App

This project is a secure Todo application built using **Next.js (App Router)** and **FastAPI**, with a strong focus on modern authentication patterns like **Google OAuth** and **Passkeys**.

---

## 🛠️ The Tech Stack
*   **Frontend**: Next.js 15 (App Router) + Tailwind CSS.
*   **Authentication**: Better Auth (with Google & WebAuthn/Passkey support).
*   **Backend**: FastAPI (Python 3.12).
*   **Database**: SQLite with SQLAlchemy (Migrated to **LibSQL/Turso** for production).
*   **Email**: Brevo (Transactional API).

---

## 🏗️ Phase-by-Phase Development

### 1. Authentication with Better Auth
I started by setting up **Better Auth**. The requirement was to support both Google Sign-In and Passkeys. Better Auth made Passkey integration surprisingly smooth, but I spent some time configuring the `auth-client` to work correctly with the Next.js App Router.
*   **Decision**: I used the `databaseHooks` in Better Auth to trigger welcome emails automatically whenever a new user is created in the database.

### 2. The Backend & The JWT Challenge
This was the most critical part of the project: **How to share the auth context with the Python backend?**

*   **My Approach (JWKS)**: Better Auth issues session tokens and also provides a public JWKS (JSON Web Key Set) endpoint at `/api/auth/jwks`. I decided to make the FastAPI backend fetch this public key dynamically.
*   **The Problem**: Initially, I tried using the `python-jose` library. However, I ran into a wall because `python-jose` struggled with the modern **EdDSA** (asymmetric) tokens issued by Better Auth.
*   **The Pivot**: I pivoted to **`PyJWT`**. It handled the asymmetric key verification much better. Now, the backend validates the JWT on every request, checks for expiry, and ensures strict data isolation.

### 3. Email Integration & The SDK Headache
The project required using **Brevo** for transactional emails. This is where I hit a major build issue.
*   **The Issue**: The official `@getbrevo/brevo` SDK is not fully compatible with **Next.js 15 / Turbopack**. I kept getting a `Export 'SendSmtpEmail' doesn't exist` error during `npm run dev`.
*   **The Solution**: Instead of wasting hours trying to patch a broken library, I decided to use a **raw Fetch API call** to Brevo's REST endpoint. This is actually a better architectural decision for this project because it's lightweight and zero-dependency.

### 4. UI Polish & Bonus Features
For the UI, I wanted something more than a basic list.
*   I added **Sonner** for toast notifications (so you get a nice pop-up when a task is added).
*   I used **Lucide-React** for consistent iconography.
*   I implemented **Loading States** on all buttons (using `isActionLoading` states) to make the app feel responsive.

### 5. NEW: Production Deployment & Serverless Resilience
The final step was moving from a local environment to **Vercel** and **Render**, which introduced a new series of "real-world" challenges.

*   **The Issue (SQLite Persistence)**: Standard SQLite files in the `/tmp` folder are ephemeral on Vercel. This caused user sessions to vanish (State Mismatch error) after a few minutes of inactivity.
*   **The Solution**: I migrated the authentication database to **LibSQL** and integrated **Turso**. This distributed cloud database ensures that sessions remain persistent across all serverless instances globally.
*   **The Issue (Environment Mismatches)**: I encountered CORS and 500 errors caused by trailing slashes and quotes in cloud environment variables.
*   **The Solution**: I implemented a **Global Configuration Validator** in the FastAPI backend and refined the `main.py` CORS logic to automatically sanitize URLs, ensuring a robust connection between Vercel and Render.

---

## 🧪 Testing Strategy
I integrated unit testing at every stage to ensure the "handshake" between Next.js and FastAPI never broke.
*   **Backend (10 tests)**: Verified that the JWT middleware correctly blocks invalid tokens and that data isolation is strictly enforced.
*   **Frontend (13 tests)**: Tested the API client, the dashboard rendering, and the email logic.

---

## 🚧 Deep Dive: Technical Challenges & Solutions

### 1. The JWT Algorithm & Architectural Alignment
Better Auth utilizes **EdDSA (Ed25519)**. I implemented a dynamic JWKS resolver to ensure the system is decoupled and secure.

### 2. Solving the Token Retrieval Issue
I created a manual JWT retrieval step in `api-client.ts` that fetches the token from `/api/auth/token` before every API call to ensure maximum stability.

### 3. Forcing Google OAuth Consent
To ensure a reliable testing environment, I added the `prompt: "select_account consent"` parameter to the Google provider. This forces the account selection and permission screens on every login, preventing silent login failures during development.

### 4. Docker Networking & Volume Isolation
I resolved a critical issue where the backend could not reach the frontend's JWKS endpoint within Docker due to `localhost` resolution. I introduced `INTERNAL_AUTH_URL` for container-to-container communication and implemented **anonymous volumes** for `.next` and `node_modules` to prevent permission conflicts (os error 13) between Docker and the host machine.

---

## 🏁 Summary
By solving these issues—from **asymmetric JWTs** to **serverless persistence with Turso**—I've built a project that is much more robust than the original prototype. The journey from a local SQLite setup to a globally distributed architecture has made the application truly production-ready.

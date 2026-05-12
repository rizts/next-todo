# Technical Walkthrough: Full-Stack Todo App

This project is a secure Todo application built using **Next.js (App Router)** and **FastAPI**, with a strong focus on modern authentication patterns like **Google OAuth** and **Passkeys**.

---

## 🛠️ The Tech Stack
*   **Frontend**: Next.js 15 (App Router) + Tailwind CSS.
*   **Authentication**: Better Auth (with Google & WebAuthn/Passkey support).
*   **Backend**: FastAPI (Python 3.12).
*   **Database**: SQLite with SQLAlchemy (for per-user data isolation).
*   **Email**: Brevo (Transactional API).

---

## 🏗️ Phase-by-Phase Development

### 1. Authentication with Better Auth
I started by setting up **Better Auth**. The requirement was to support both Google Sign-In and Passkeys. Better Auth made Passkey integration surprisingly smooth, but I spent some time configuring the `auth-client` to work correctly with the Next.js App Router.
*   **Decision**: I used the `databaseHooks` in Better Auth to trigger welcome emails automatically whenever a new user is created in the SQLite database.

### 2. The Backend & The JWT Challenge
This was the most critical part of the project: **How to share the auth context with the Python backend?**

*   **My Approach (JWKS)**: Better Auth issues session tokens and also provides a public JWKS (JSON Web Key Set) endpoint at `/api/auth/jwks`. I decided to make the FastAPI backend fetch this public key dynamically.
*   **The Problem**: Initially, I tried using the `python-jose` library (which is very common in FastAPI tutorials). However, I ran into a wall because `python-jose` struggled with the modern **EdDSA** (asymmetric) tokens issued by Better Auth.
*   **The Pivot**: I pivoted to **`PyJWT`**. It handled the asymmetric key verification much better. Now, the backend validates the JWT on every request, checks for expiry, and ensures that User A can never see User B's data (enforcing 401/403 codes as requested).

### 3. Email Integration & The SDK Headache
The project required using **Brevo** for transactional emails. This is where I hit a major build issue.
*   **The Issue**: The official `@getbrevo/brevo` SDK is not fully compatible with **Next.js 15 / Turbopack**. I kept getting a `Export 'SendSmtpEmail' doesn't exist` error during `npm run dev`. It seems to be a conflict between their module format and the new ESM standards.
*   **The Solution**: Instead of wasting hours trying to patch a broken library, I decided to use a **raw Fetch API call** to Brevo's REST endpoint. This is actually a better "architectural decision" for this project because it's lightweight, has zero dependencies, and won't break during future Next.js updates.

### 4. UI Polish & Bonus Features
For the UI, I wanted something more than a basic list.
*   I added **Sonner** for toast notifications (so you get a nice pop-up when a task is added).
*   I used **Lucide-React** for consistent iconography.
*   I implemented **Loading States** on all buttons (using `isActionLoading` states) to make the app feel responsive even when the API is slow.

---

## 🧪 Testing Strategy
I integrated unit testing at every stage to ensure the "handshake" between Next.js and FastAPI never broke.
*   **Backend (10 tests)**: Verified that the JWT middleware correctly blocks invalid tokens and that data isolation is strictly enforced.
*   **Frontend (13 tests)**: Tested the API client, the dashboard rendering, and the email logic.

---

## 🚧 Deep Dive: Technical Challenges & Solutions

Developing this project wasn't just about writing code; it was about solving a series of "headaches" that forced me to rethink my architecture several times. Here is the full story of the hurdles I faced:

### 1. The JWT Algorithm Conflict (The EdDSA vs HS256 Drama)
Initially, I planned to use a simple symmetric signing method (HS256) where both the frontend and backend share a secret key. However, I quickly realized that **Better Auth** defaults to **EdDSA (asymmetric signing)** for better security.

*   **The Conflict**: I tried to use `python-jose`, which is the standard library for FastAPI auth. But `python-jose` is quite old and doesn't support the modern EdDSA public keys provided by Better Auth's JWKS endpoint.
*   **The Solution**: I had to ditch my initial backend auth logic and switch to **`PyJWT`**. I built a dynamic JWKS fetcher that pulls the public key directly from the frontend's `/api/auth/jwks` endpoint. This "handshake" allows the backend to verify users securely without ever needing a shared secret. It was more work, but it made the app much more "production-ready."

### 2. The Brevo SDK & Next.js 15 Compatibility
I tried to follow the "official" way of sending emails by installing the `@getbrevo/brevo` SDK. This turned out to be a major mistake in a **Next.js 15 (Turbopack)** environment.

*   **The Error**: Every time I tried to run the app, I got a cryptic error: `Export 'SendSmtpEmail' doesn't exist in target module`. This happened because the Brevo SDK uses an older module format that clashes with the strict ESM (ES Modules) requirements of Next.js 15 and Turbopack.
*   **The Fix**: Instead of spending hours trying to patch a third-party library, I decided to bypass the SDK entirely. I wrote a simple wrapper using the **standard Fetch API** to call Brevo's REST endpoint. This removed a heavy dependency from my project and fixed all the build errors instantly.

### 3. Solving the Token Retrieval Issue
Early on, the backend kept returning `401 Unauthorized` because it couldn't find the token in the headers correctly.
*   **The Fix**: I realized that relying on the library's internal session handling was sometimes flaky across the frontend-backend bridge. I solved this by creating a manual JWT retrieval step in my `api-client.ts` that fetches the token from `/api/auth/token` before every API call. This made the auth flow extremely stable.

### 4. Enforcing Data Isolation
A major requirement was ensuring that User A can't see User B's todos. 
*   **The Implementation**: I spent extra time in the FastAPI middleware and routes to ensure that every database query is filtered by the `user_id` extracted from the verified JWT. I wrote specific tests to try and "hack" the API with a valid token from a different user, ensuring it correctly returns a `403 Forbidden` or `401 Unauthorized`.

---

## 🏁 Summary
By solving these issues, I ended up with a project that is much more robust than what I originally envisioned. The pivot to **Asymmetric JWT Handshakes** and the **Manual Fetch API for emails** turned out to be better architectural decisions than the "standard" library-heavy approach.

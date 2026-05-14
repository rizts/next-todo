import { betterAuth } from "better-auth";
import { passkey } from "@better-auth/passkey";
import { jwt } from "better-auth/plugins";
import Database from "better-sqlite3";
import path from "path";

// Initialize SQLite database for Better Auth
// In Vercel (Production), we must use /tmp directory as it's the only writable area.
const isVercel = process.env.VERCEL === "1";
const dbPath = isVercel 
    ? path.join("/tmp", "auth.db")
    : (process.env.DATABASE_URL?.replace("file:", "") || path.join(process.cwd(), "auth.db"));

let db;
try {
    db = new Database(dbPath);
    console.log("Database initialized successfully at:", dbPath);
    
    // Create tables manually if they don't exist (needed for Vercel /tmp setup)
    db.exec(`
        CREATE TABLE IF NOT EXISTS user (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            emailVerified BOOLEAN NOT NULL,
            image TEXT,
            createdAt DATETIME NOT NULL,
            updatedAt DATETIME NOT NULL
        );
        CREATE TABLE IF NOT EXISTS session (
            id TEXT PRIMARY KEY,
            userId TEXT NOT NULL REFERENCES user(id),
            token TEXT NOT NULL UNIQUE,
            expiresAt DATETIME NOT NULL,
            ipAddress TEXT,
            userAgent TEXT,
            createdAt DATETIME NOT NULL,
            updatedAt DATETIME NOT NULL
        );
        CREATE TABLE IF NOT EXISTS account (
            id TEXT PRIMARY KEY,
            userId TEXT NOT NULL REFERENCES user(id),
            accountId TEXT NOT NULL,
            providerId TEXT NOT NULL,
            accessToken TEXT,
            refreshToken TEXT,
            idToken TEXT,
            accessTokenExpiresAt DATETIME,
            refreshTokenExpiresAt DATETIME,
            scope TEXT,
            password TEXT,
            createdAt DATETIME NOT NULL,
            updatedAt DATETIME NOT NULL
        );
        CREATE TABLE IF NOT EXISTS verification (
            id TEXT PRIMARY KEY,
            identifier TEXT NOT NULL,
            value TEXT NOT NULL,
            expiresAt DATETIME NOT NULL,
            createdAt DATETIME NOT NULL,
            updatedAt DATETIME NOT NULL
        );
    `);
    
    // Fallback: Add idToken if table existed without it
    try { db.exec("ALTER TABLE account ADD COLUMN idToken TEXT;"); } catch (e) {}
    
    console.log("Database tables verified/created successfully.");
} catch (e) {
    console.error("Failed to initialize database:", e);
    // Fallback or rethrow to see in logs
    throw e;
}

// Masked logging for debugging environment variables
const rawBaseURL = process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000";
const normalizedBaseURL = rawBaseURL.endsWith("/") ? rawBaseURL.slice(0, -1) : rawBaseURL;

console.log("BETTER_AUTH_URL (Normalized):", normalizedBaseURL);
console.log("BETTER_AUTH_SECRET present:", !!process.env.BETTER_AUTH_SECRET);
console.log("GOOGLE_CLIENT_ID length:", process.env.GOOGLE_CLIENT_ID?.length || 0);
console.log("GOOGLE_CLIENT_SECRET present:", !!process.env.GOOGLE_CLIENT_SECRET);

import { sendWelcomeEmail } from "./email";

export const auth = betterAuth({
    database: db,
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: normalizedBaseURL,
    emailAndPassword: {
        enabled: false,
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        },
    },
    plugins: [
        passkey(), 
        jwt()
    ],
});

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
console.log("BETTER_AUTH_URL:", process.env.BETTER_AUTH_URL);
console.log("BETTER_AUTH_SECRET present:", !!process.env.BETTER_AUTH_SECRET);
console.log("GOOGLE_CLIENT_ID present:", !!process.env.GOOGLE_CLIENT_ID);

import { sendWelcomeEmail } from "./email";

export const auth = betterAuth({
    database: db,
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000",
    emailAndPassword: {
        enabled: false, // We only use Google and Passkey
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        },
    },
    databaseHooks: {
        user: {
            create: {
                after: async (user) => {
                    console.log("Hook: New user created in DB:", user.email);
                    try {
                        await sendWelcomeEmail(user.email, user.name || "User");
                        console.log("Welcome email sent successfully.");
                    } catch (emailError) {
                        console.error("Failed to send welcome email, but user creation will continue:", emailError);
                    }
                }
            }
        }
    },
    plugins: [
        passkey(), 
        jwt()
    ],
});

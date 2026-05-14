import { betterAuth } from "better-auth";
import { passkey } from "@better-auth/passkey";
import { jwt } from "better-auth/plugins";
import Database from "better-sqlite3";
import path from "path";
import { sendWelcomeEmail } from "./email";

// Initialize SQLite database for Better Auth
const isVercel = process.env.VERCEL === "1";
const dbPath = isVercel 
    ? path.join("/tmp", "auth.db")
    : (process.env.DATABASE_URL?.replace("file:", "") || path.join(process.cwd(), "auth.db"));

let db: any;
try {
    db = new Database(dbPath);
    console.log("Database initialized successfully at:", dbPath);
    console.log("Database object type:", typeof db);
    console.log("Database methods:", Object.keys(db).filter(k => typeof (db as any)[k] === "function"));
    
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
            session_state TEXT,
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
    console.log("Database tables verified/created successfully.");
} catch (e) {
    console.error("Failed to initialize database:", e);
    throw e;
}

const getBaseURL = () => {
    if (process.env.BETTER_AUTH_URL) return process.env.BETTER_AUTH_URL;
    if (process.env.NEXT_PUBLIC_BETTER_AUTH_URL) return process.env.NEXT_PUBLIC_BETTER_AUTH_URL;
    // Vercel deployment URL (always https)
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
    return "http://localhost:3000";
};

const rawBaseURL = getBaseURL();
const normalizedBaseURL = rawBaseURL.endsWith("/") ? rawBaseURL.slice(0, -1) : rawBaseURL;

console.log("Better Auth - Environment:", process.env.VERCEL === "1" ? "Vercel" : "Local/Other");
console.log("Better Auth - Base URL:", normalizedBaseURL);

export const auth = betterAuth({
    database: {
        provider: "sqlite",
        db: db,
    },
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: normalizedBaseURL,
    logger: {
        level: "debug",
    },
    pages: {
        signIn: "/login",
    },
    emailAndPassword: {
        enabled: false,
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
            redirectURI: normalizedBaseURL + "/api/auth/callback/google",
        },
    },
    plugins: [
        passkey(), 
        jwt()
    ],
});

import { betterAuth } from "better-auth";
import { passkey } from "@better-auth/passkey";
import { jwt } from "better-auth/plugins";
import { createClient } from "@libsql/client";
import { Kysely } from "kysely";
import { LibsqlDialect } from "kysely-libsql";
import { kyselyAdapter } from "@better-auth/kysely-adapter";

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

// Use LibSQL for better Vercel compatibility
const isVercel = process.env.VERCEL === "1";
const dbUrl = isVercel 
    ? "file:/tmp/auth.db"
    : (process.env.DATABASE_URL || "file:auth.db");

const client = createClient({
    url: dbUrl,
});

// Initialize tables if they don't exist (Top-level await is supported in Node 20+)
try {
    await client.batch([
        `CREATE TABLE IF NOT EXISTS user (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            emailVerified BOOLEAN NOT NULL,
            image TEXT,
            createdAt DATETIME NOT NULL,
            updatedAt DATETIME NOT NULL
        )`,
        `CREATE TABLE IF NOT EXISTS session (
            id TEXT PRIMARY KEY,
            userId TEXT NOT NULL REFERENCES user(id),
            token TEXT NOT NULL UNIQUE,
            expiresAt DATETIME NOT NULL,
            ipAddress TEXT,
            userAgent TEXT,
            createdAt DATETIME NOT NULL,
            updatedAt DATETIME NOT NULL
        )`,
        `CREATE TABLE IF NOT EXISTS account (
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
        )`,
        `CREATE TABLE IF NOT EXISTS verification (
            id TEXT PRIMARY KEY,
            identifier TEXT NOT NULL,
            value TEXT NOT NULL,
            expiresAt DATETIME NOT NULL,
            createdAt DATETIME NOT NULL,
            updatedAt DATETIME NOT NULL
        )`,
        `CREATE TABLE IF NOT EXISTS passkey (
            id TEXT PRIMARY KEY,
            name TEXT,
            publicKey TEXT NOT NULL,
            userId TEXT NOT NULL REFERENCES user(id),
            credentialID TEXT NOT NULL,
            counter INTEGER NOT NULL,
            deviceType TEXT NOT NULL,
            backedUp BOOLEAN NOT NULL,
            transports TEXT,
            createdAt DATETIME
        )`,
        `CREATE TABLE IF NOT EXISTS jwks (
            id TEXT PRIMARY KEY,
            publicKey TEXT NOT NULL,
            privateKey TEXT NOT NULL,
            createdAt DATETIME NOT NULL
        )`
    ], "write");
    console.log("Database tables verified/created successfully.");
} catch (e) {
    console.error("Database initialization warning (might be expected during build):", e);
}

// Explicitly create a Kysely instance to avoid auto-detection issues on Vercel
const db = new Kysely<any>({
    dialect: new LibsqlDialect({
        client: client,
    }),
});

export const auth = betterAuth({
    database: kyselyAdapter(db, {
        type: "sqlite",
    }),
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

import { betterAuth } from "better-auth";
import { passkey } from "@better-auth/passkey";
import { jwt } from "better-auth/plugins";
import Database from "better-sqlite3";
import path from "path";

// Initialize SQLite database for Better Auth
const dbPath = process.env.DATABASE_URL?.replace("file:", "") || path.join(process.cwd(), "auth.db");
const db = new Database(dbPath);

export const auth = betterAuth({
    database: db,
    baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
    emailAndPassword: {
        enabled: false, // We only use Google and Passkey
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        },
    },
    plugins: [
        passkey(), 
        jwt({
            secret: process.env.BETTER_AUTH_SECRET,
            jwks: {
                disabled: true // Mematikan JWKS agar menggunakan HS256 (Symmetric)
            }
        })
    ],
});

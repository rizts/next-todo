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
} catch (e) {
    console.error("Failed to initialize database:", e);
    // Fallback or rethrow to see in logs
    throw e;
}

import { sendWelcomeEmail } from "./email";

export const auth = betterAuth({
    database: db,
    secret: process.env.BETTER_AUTH_SECRET,
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
    databaseHooks: {
        user: {
            create: {
                after: async (user) => {
                    console.log("New user created, sending welcome email to:", user.email);
                    await sendWelcomeEmail(user.email, user.name || "User");
                }
            }
        }
    },
    plugins: [
        passkey(), 
        jwt()
    ],
});

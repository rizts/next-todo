import { betterAuth } from "better-auth";
import { passkey } from "@better-auth/passkey";
import { jwt } from "better-auth/plugins";
import { createClient } from "@libsql/client";

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
// It works exactly like SQLite but doesn't have native binding issues
const isVercel = process.env.VERCEL === "1";
const dbUrl = isVercel 
    ? "file:/tmp/auth.db"
    : (process.env.DATABASE_URL || "file:auth.db");

const client = createClient({
    url: dbUrl,
});

export const auth = betterAuth({
    database: {
        provider: "libsql",
        db: client,
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

import { createAuthClient } from "better-auth/react";
import { passkeyClient } from "@better-auth/passkey/client";
import { jwtClient } from "better-auth/client/plugins";

const getBaseURL = () => {
    if (process.env.NEXT_PUBLIC_BETTER_AUTH_URL) {
        return process.env.NEXT_PUBLIC_BETTER_AUTH_URL;
    }
    if (typeof window !== "undefined") {
        return window.location.origin;
    }
    return "http://localhost:3000";
};

const baseURL = getBaseURL();
console.log("Better Auth Base URL (Resolved):", baseURL);

export const authClient = createAuthClient({
    baseURL,
    plugins: [
        passkeyClient(),
        jwtClient()
    ],
});

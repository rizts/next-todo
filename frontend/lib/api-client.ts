import { authClient } from "./auth-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
    // 1. Ambil JWT menggunakan endpoint /token (standard Better Auth JWT plugin)
    const { data: tokenData } = await authClient.jwt.getToken().catch(() => ({ data: null }));
    let token = tokenData?.token;

    // 2. Fallback: Cek di session data (beberapa versi menyimpan di sini)
    if (!token) {
        const { data: sessionData } = await authClient.getSession().catch(() => ({ data: null }));
        token = (sessionData as any)?.session?.jwt || (sessionData as any)?.jwt;
    }

    if (!token) {
        console.warn("No JWT token found. Backend will likely reject this request.");
    }

    const headers = {
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        ...options.headers,
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        if (response.status === 401) {
            // Optional: Handle unauthorized
        }
        const error = await response.json().catch(() => ({ detail: "Unknown error" }));
        throw new Error(error.detail || "API Request failed");
    }

    return response.json();
}

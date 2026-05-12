import { betterFetch } from "@better-fetch/fetch";
import { NextResponse, type NextRequest } from "next/server";

// Kita tidak boleh import dari @/lib/auth karena mengandung better-sqlite3 (Native module)
// Cukup gunakan fetch untuk validasi session di middleware (Edge compatible)
export default async function authMiddleware(request: NextRequest) {
    const { data: session } = await betterFetch<any>(
        "/api/auth/get-session",
        {
            baseURL: request.nextUrl.origin,
            headers: {
                cookie: request.headers.get("cookie") || "",
            },
        }
    );

    if (!session) {
        return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
}

export const config = {
    matcher: ["/dashboard/:path*"],
};

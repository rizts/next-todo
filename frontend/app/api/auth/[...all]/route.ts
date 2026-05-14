import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
import { NextRequest } from "next/server";

const handler = toNextJsHandler(auth);

export const GET = async (req: NextRequest) => {
    console.log("Auth GET Request:", req.url);
    return await handler.GET(req);
};

export const POST = async (req: NextRequest) => {
    console.log("Auth POST Request:", req.url);
    return await handler.POST(req);
};

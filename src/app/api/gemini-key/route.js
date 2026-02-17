import { NextResponse } from "next/server";

// Provides the Gemini API key to the client at runtime
// This avoids baking the key into the JS bundle via NEXT_PUBLIC_ prefix
export async function GET() {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
        return NextResponse.json(
            { error: "GEMINI_API_KEY is not configured on the server." },
            { status: 500 }
        );
    }
    return NextResponse.json({ key });
}

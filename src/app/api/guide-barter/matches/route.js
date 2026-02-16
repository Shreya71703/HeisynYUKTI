import { NextResponse } from "next/server";
import { findMatches } from "../store";

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
        return NextResponse.json(
            { error: "userId is required" },
            { status: 400 }
        );
    }

    const matches = findMatches(userId);
    return NextResponse.json({ matches });
}

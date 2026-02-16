import { NextResponse } from "next/server";
import { addMessage, getMessages, getConversations } from "../store";

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const otherId = searchParams.get("otherId");

    if (!userId) {
        return NextResponse.json(
            { error: "userId is required" },
            { status: 400 }
        );
    }

    // If otherId is provided, get messages between two users
    if (otherId) {
        const messages = getMessages(userId, otherId);
        return NextResponse.json({ messages });
    }

    // Otherwise, get conversation list
    const conversations = getConversations(userId);
    return NextResponse.json({ conversations });
}

export async function POST(request) {
    const body = await request.json();
    const { fromId, toId, content, type } = body;

    if (!fromId || !toId || !content) {
        return NextResponse.json(
            { error: "fromId, toId, and content are required" },
            { status: 400 }
        );
    }

    const message = addMessage(fromId, toId, content, type || "text");
    return NextResponse.json({ message }, { status: 201 });
}

import { NextResponse } from "next/server";
import { getUsers, addUser, updateUser } from "../store";

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const skill = searchParams.get("skill");
    const users = getUsers(skill);
    return NextResponse.json({ users });
}

export async function POST(request) {
    const body = await request.json();

    // If user has an ID, try update first — if not found, addUser handles it
    if (body.id) {
        const updated = updateUser(body.id, body);
        return NextResponse.json({ user: updated });
    }

    // New user without ID
    const user = addUser(body);
    return NextResponse.json({ user }, { status: 201 });
}

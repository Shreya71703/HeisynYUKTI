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
    const { id, ...data } = body;

    if (id) {
        const updated = updateUser(id, data);
        if (!updated) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }
        return NextResponse.json({ user: updated });
    }

    const user = addUser(data);
    return NextResponse.json({ user }, { status: 201 });
}

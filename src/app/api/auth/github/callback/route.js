import { NextResponse } from "next/server";

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    if (!code) {
        return NextResponse.redirect(`${appUrl}/guide-barter?error=no_code`);
    }

    try {
        // Exchange code for access token
        const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify({
                client_id: process.env.GITHUB_CLIENT_ID,
                client_secret: process.env.GITHUB_CLIENT_SECRET,
                code,
            }),
        });

        const tokenData = await tokenRes.json();

        if (tokenData.error) {
            return NextResponse.redirect(
                `${appUrl}/guide-barter?error=${tokenData.error}`
            );
        }

        const accessToken = tokenData.access_token;

        // Fetch the authenticated user's profile
        const userRes = await fetch("https://api.github.com/user", {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: "application/vnd.github.v3+json",
            },
        });

        const userData = await userRes.json();

        // Redirect back with token and username in URL hash (client-side only)
        const redirectUrl = new URL(`${appUrl}/guide-barter`);
        redirectUrl.hash = `github_token=${accessToken}&github_user=${userData.login}&github_name=${encodeURIComponent(userData.name || userData.login)}&github_avatar=${encodeURIComponent(userData.avatar_url || "")}`;

        return NextResponse.redirect(redirectUrl.toString());
    } catch (error) {
        console.error("GitHub OAuth error:", error);
        return NextResponse.redirect(`${appUrl}/guide-barter?error=auth_failed`);
    }
}

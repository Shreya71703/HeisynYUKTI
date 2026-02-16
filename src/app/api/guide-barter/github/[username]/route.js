import { NextResponse } from "next/server";

export async function GET(request, { params }) {
    const { username } = params;

    if (!username) {
        return NextResponse.json(
            { error: "Username is required" },
            { status: 400 }
        );
    }

    // Check for auth token (from GitHub OAuth)
    const authHeader = request.headers.get("authorization");
    const headers = {
        Accept: "application/vnd.github.v3+json",
    };
    if (authHeader) {
        headers.Authorization = authHeader;
    }

    try {
        // Fetch user profile
        const profileRes = await fetch(
            `https://api.github.com/users/${username}`,
            { headers }
        );

        if (!profileRes.ok) {
            return NextResponse.json(
                { error: "GitHub user not found" },
                { status: 404 }
            );
        }

        const profile = await profileRes.json();

        // Fetch ALL repositories (paginated)
        let allRepos = [];
        let page = 1;
        let hasMore = true;

        while (hasMore) {
            const reposRes = await fetch(
                `https://api.github.com/users/${username}/repos?per_page=100&page=${page}&sort=updated`,
                { headers }
            );
            const repos = await reposRes.json();

            if (!Array.isArray(repos) || repos.length === 0) {
                hasMore = false;
            } else {
                allRepos = allRepos.concat(repos);
                page++;
                if (repos.length < 100) hasMore = false;
            }
            // Safety limit
            if (page > 10) hasMore = false;
        }

        // Calculate detailed language stats
        const languageCounts = {};
        const languageBytes = {};
        let totalStars = 0;
        let totalForks = 0;
        let totalWatchers = 0;
        const repoDetails = [];

        // Fetch language breakdown for top repos (authenticated gets more quota)
        const langFetchPromises = allRepos.slice(0, 50).map(async (repo) => {
            try {
                const langRes = await fetch(
                    `https://api.github.com/repos/${username}/${repo.name}/languages`,
                    { headers }
                );
                if (langRes.ok) {
                    const langs = await langRes.json();
                    return { repoName: repo.name, languages: langs };
                }
            } catch { }
            return { repoName: repo.name, languages: {} };
        });

        const langResults = await Promise.all(langFetchPromises);
        const repoLanguageMap = {};
        langResults.forEach(({ repoName, languages }) => {
            repoLanguageMap[repoName] = languages;
            Object.entries(languages).forEach(([lang, bytes]) => {
                languageBytes[lang] = (languageBytes[lang] || 0) + bytes;
            });
        });

        allRepos.forEach((repo) => {
            if (repo.language) {
                languageCounts[repo.language] =
                    (languageCounts[repo.language] || 0) + 1;
            }
            totalStars += repo.stargazers_count || 0;
            totalForks += repo.forks_count || 0;
            totalWatchers += repo.watchers_count || 0;

            repoDetails.push({
                name: repo.name,
                description: repo.description,
                language: repo.language,
                languages: repoLanguageMap[repo.name] || {},
                stars: repo.stargazers_count,
                forks: repo.forks_count,
                watchers: repo.watchers_count,
                url: repo.html_url,
                homepage: repo.homepage,
                updatedAt: repo.updated_at,
                createdAt: repo.created_at,
                isForked: repo.fork,
                defaultBranch: repo.default_branch,
                topics: repo.topics || [],
                size: repo.size,
            });
        });

        // Sort languages by byte count (most accurate)
        const totalBytes = Object.values(languageBytes).reduce(
            (a, b) => a + b,
            0
        );
        const topLanguages = Object.entries(languageBytes)
            .sort((a, b) => b[1] - a[1])
            .map(([name, bytes]) => ({
                name,
                bytes,
                count: languageCounts[name] || 0,
                percentage: totalBytes > 0 ? Math.round((bytes / totalBytes) * 100) : 0,
            }));

        // Scorecard data
        const scorecard = {
            totalRepos: allRepos.length,
            totalStars,
            totalForks,
            totalWatchers,
            originalRepos: allRepos.filter((r) => !r.fork).length,
            forkedRepos: allRepos.filter((r) => r.fork).length,
            totalLanguages: topLanguages.length,
            topLanguage: topLanguages[0]?.name || "N/A",
            accountAge: profile.created_at
                ? `${Math.floor((Date.now() - new Date(profile.created_at)) / (365.25 * 24 * 60 * 60 * 1000))} years`
                : "N/A",
            totalCodeBytes: totalBytes,
        };

        // Skill levels (normalized 0-100 based on bytes written in each language)
        const maxBytes = topLanguages[0]?.bytes || 1;
        const skillLevels = {};
        topLanguages.forEach((lang) => {
            skillLevels[lang.name] = Math.round(
                Math.min(100, (lang.bytes / maxBytes) * 100)
            );
        });

        // Badge System
        const badges = [];
        // Repo count badges
        if (allRepos.length >= 50) {
            badges.push({ type: "gold", label: "Gold Developer", icon: "🥇", description: "50+ repositories" });
        } else if (allRepos.length >= 25) {
            badges.push({ type: "silver", label: "Silver Developer", icon: "🥈", description: "25+ repositories" });
        } else if (allRepos.length >= 10) {
            badges.push({ type: "bronze", label: "Bronze Developer", icon: "🥉", description: "10+ repositories" });
        }
        // Special badges
        if (totalStars >= 50) {
            badges.push({ type: "star", label: "Star Collector", icon: "⭐", description: `${totalStars} total stars` });
        } else if (totalStars >= 10) {
            badges.push({ type: "rising-star", label: "Rising Star", icon: "✨", description: `${totalStars} total stars` });
        }
        if (totalForks >= 100) {
            badges.push({ type: "contributor", label: "Open Source Hero", icon: "🔥", description: `${totalForks} total forks` });
        } else if (totalForks >= 20) {
            badges.push({ type: "contributor", label: "Contributor", icon: "🔥", description: `${totalForks} total forks` });
        }
        if (topLanguages.length >= 8) {
            badges.push({ type: "polyglot", label: "Polyglot", icon: "🌍", description: `${topLanguages.length} languages` });
        } else if (topLanguages.length >= 4) {
            badges.push({ type: "multilingual", label: "Multilingual", icon: "🗣️", description: `${topLanguages.length} languages` });
        }
        if (profile.followers >= 50) {
            badges.push({ type: "influencer", label: "Influencer", icon: "👥", description: `${profile.followers} followers` });
        }
        // Activity badge based on recent activity
        const recentRepos = allRepos.filter((r) => {
            const updated = new Date(r.updated_at);
            return Date.now() - updated < 30 * 24 * 60 * 60 * 1000; // 30 days
        });
        if (recentRepos.length >= 5) {
            badges.push({ type: "active", label: "Highly Active", icon: "⚡", description: `${recentRepos.length} repos updated in 30 days` });
        }

        // Badge tier (highest)
        const badgeTier = allRepos.length >= 50 ? "gold" : allRepos.length >= 25 ? "silver" : allRepos.length >= 10 ? "bronze" : "none";

        return NextResponse.json({
            profile: {
                login: profile.login,
                name: profile.name,
                avatar: profile.avatar_url,
                bio: profile.bio,
                company: profile.company,
                location: profile.location,
                blog: profile.blog,
                publicRepos: profile.public_repos,
                followers: profile.followers,
                following: profile.following,
                url: profile.html_url,
                createdAt: profile.created_at,
            },
            topLanguages,
            skillLevels,
            repos: repoDetails,
            totalRepos: repoDetails.length,
            scorecard,
            badges,
            badgeTier,
        });
    } catch (error) {
        console.error("GitHub API error:", error);
        return NextResponse.json(
            { error: "Failed to fetch GitHub data" },
            { status: 500 }
        );
    }
}

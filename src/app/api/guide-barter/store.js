// In-memory data store for Guide Barter System
// This persists during server runtime only

const store = {
    users: [],
    messages: [],
    nextUserId: 1,
    nextMessageId: 1,
};

export function getStore() {
    return store;
}

export function addUser(userData) {
    const user = {
        id: String(store.nextUserId++),
        name: userData.name || "Anonymous",
        avatar: userData.avatar || null,
        skillsKnown: userData.skillsKnown || [],
        skillsWanted: userData.skillsWanted || [],
        githubUsername: userData.githubUsername || "",
        leetcodeUsername: userData.leetcodeUsername || "",
        targetCareer: userData.targetCareer || "Full Stack Developer",
        resumeLink: userData.resumeLink || "",
        projectLinks: userData.projectLinks || [],
        studentId: userData.studentId || "",
        collegeName: userData.collegeName || "",
        yearOfStudy: userData.yearOfStudy || "",
        githubToken: userData.githubToken || "",
        createdAt: new Date().toISOString(),
    };
    store.users.push(user);
    return user;
}

export function updateUser(id, userData) {
    const index = store.users.findIndex((u) => u.id === id);
    if (index === -1) return null;
    store.users[index] = { ...store.users[index], ...userData };
    return store.users[index];
}

export function getUsers(skillFilter) {
    if (skillFilter) {
        const skill = skillFilter.toLowerCase();
        return store.users.filter((u) =>
            u.skillsKnown.some((s) => s.toLowerCase().includes(skill))
        );
    }
    return store.users;
}

export function getUserById(id) {
    return store.users.find((u) => u.id === id) || null;
}

export function findMatches(userId) {
    const user = getUserById(userId);
    if (!user) return [];

    return store.users
        .filter((u) => u.id !== userId)
        .map((candidate) => {
            // Skills the candidate knows that the user wants
            const theyTeachMe = candidate.skillsKnown.filter((s) =>
                user.skillsWanted.some(
                    (w) => w.toLowerCase() === s.toLowerCase()
                )
            );
            // Skills the user knows that the candidate wants
            const iTeachThem = user.skillsKnown.filter((s) =>
                candidate.skillsWanted.some(
                    (w) => w.toLowerCase() === s.toLowerCase()
                )
            );

            // --- Advanced Weighted Matching Algorithm ---

            // 1. Skill Overlap Score (40% weight) — common skills / target skills
            const targetSkillsCount = Math.max(user.skillsWanted.length, 1);
            const skillOverlapScore = Math.min(100, (theyTeachMe.length / targetSkillsCount) * 100);

            // 2. Mutual Benefit Score (30% weight) — both sides benefit
            const totalWanted = Math.max(user.skillsWanted.length + candidate.skillsWanted.length, 1);
            const mutualBenefitScore = Math.min(100,
                ((theyTeachMe.length + iTeachThem.length) / totalWanted) * 100
            );

            // 3. GitHub Language Overlap (20% weight)
            let githubLangScore = 0;
            if (user.githubUsername && candidate.githubUsername) {
                // Both have GitHub — bonus for shared tech ecosystem
                const userSkillsLower = user.skillsKnown.map(s => s.toLowerCase());
                const candidateSkillsLower = candidate.skillsKnown.map(s => s.toLowerCase());
                const sharedSkills = userSkillsLower.filter(s => candidateSkillsLower.includes(s));
                const allUniqueSkills = new Set([...userSkillsLower, ...candidateSkillsLower]);
                githubLangScore = allUniqueSkills.size > 0
                    ? Math.min(100, (sharedSkills.length / allUniqueSkills.size) * 150) // boosted by 1.5x
                    : 0;
            }

            // 4. Diversity Bonus (10% weight) — reward complementary skill sets
            const userSkillSet = new Set(user.skillsKnown.map(s => s.toLowerCase()));
            const candidateUniqueSkills = candidate.skillsKnown.filter(
                s => !userSkillSet.has(s.toLowerCase())
            );
            const diversityScore = Math.min(100, candidateUniqueSkills.length * 15);

            // Weighted final score
            const matchScore = Math.round(
                skillOverlapScore * 0.4 +
                mutualBenefitScore * 0.3 +
                githubLangScore * 0.2 +
                diversityScore * 0.1
            );

            return {
                user: candidate,
                theyTeachMe,
                iTeachThem,
                matchScore: Math.min(100, matchScore),
                breakdown: {
                    skillOverlap: Math.round(skillOverlapScore),
                    mutualBenefit: Math.round(mutualBenefitScore),
                    githubLangOverlap: Math.round(githubLangScore),
                    diversity: Math.round(diversityScore),
                },
            };
        })
        .filter((m) => m.matchScore > 0)
        .sort((a, b) => b.matchScore - a.matchScore);
}

export function addMessage(fromId, toId, content, type = "text") {
    const msg = {
        id: String(store.nextMessageId++),
        fromId,
        toId,
        content,
        type, // "text" | "collab_request" | "collab_accept" | "collab_decline"
        timestamp: new Date().toISOString(),
    };
    store.messages.push(msg);
    return msg;
}

export function getMessages(userId1, userId2) {
    return store.messages
        .filter(
            (m) =>
                (m.fromId === userId1 && m.toId === userId2) ||
                (m.fromId === userId2 && m.toId === userId1)
        )
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
}

export function getConversations(userId) {
    const seen = new Set();
    const conversations = [];

    store.messages
        .filter((m) => m.fromId === userId || m.toId === userId)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .forEach((m) => {
            const otherId = m.fromId === userId ? m.toId : m.fromId;
            if (!seen.has(otherId)) {
                seen.add(otherId);
                const otherUser = getUserById(otherId);
                conversations.push({
                    userId: otherId,
                    userName: otherUser?.name || "Unknown",
                    lastMessage: m.content,
                    lastMessageTime: m.timestamp,
                    lastMessageType: m.type,
                });
            }
        });

    return conversations;
}

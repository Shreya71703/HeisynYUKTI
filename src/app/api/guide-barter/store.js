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
            const matchScore =
                theyTeachMe.length + iTeachThem.length > 0
                    ? Math.round(
                        ((theyTeachMe.length + iTeachThem.length) /
                            (user.skillsWanted.length +
                                candidate.skillsWanted.length || 1)) *
                        100
                    )
                    : 0;

            return {
                user: candidate,
                theyTeachMe,
                iTeachThem,
                matchScore,
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

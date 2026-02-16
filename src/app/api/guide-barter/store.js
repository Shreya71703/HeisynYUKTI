// Persistent data store for Guide Barter System
// Uses JSON file so data survives server restarts and module re-imports

import fs from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "guide-barter-data.json");

// Default seed profiles
const SEED_PROFILES = [
    {
        id: "seed-1",
        name: "Sanskar Dubey",
        avatar: null,
        skillsKnown: ["JavaScript", "React", "Node.js", "Next.js", "Python"],
        skillsWanted: ["Machine Learning", "DevOps", "Docker"],
        githubUsername: "dubeysanskar",
        leetcodeUsername: "",
        targetCareer: "Full Stack Developer",
        resumeLink: "",
        projectLinks: [],
        studentId: "",
        collegeName: "",
        yearOfStudy: "",
        githubToken: "",
        createdAt: "2026-01-01T00:00:00.000Z",
    },
    {
        id: "seed-2",
        name: "Shreya Shukla",
        avatar: null,
        skillsKnown: ["Python", "Machine Learning", "Data Science", "TensorFlow"],
        skillsWanted: ["React", "Next.js", "UI Design"],
        githubUsername: "Shreya71703",
        leetcodeUsername: "",
        targetCareer: "Data Scientist",
        resumeLink: "",
        projectLinks: [],
        studentId: "",
        collegeName: "",
        yearOfStudy: "",
        githubToken: "",
        createdAt: "2026-01-01T00:00:00.000Z",
    },
    {
        id: "seed-3",
        name: "Arjun Patel",
        avatar: null,
        skillsKnown: ["Java", "Spring Boot", "SQL", "Microservices", "AWS"],
        skillsWanted: ["React", "TypeScript", "GraphQL"],
        githubUsername: "",
        leetcodeUsername: "arjunp_dev",
        targetCareer: "Backend Developer",
        resumeLink: "",
        projectLinks: [],
        studentId: "2024CS045",
        collegeName: "IIT Delhi",
        yearOfStudy: "3rd Year",
        githubToken: "",
        createdAt: "2026-01-05T00:00:00.000Z",
    },
    {
        id: "seed-4",
        name: "Priya Sharma",
        avatar: null,
        skillsKnown: ["Flutter", "Dart", "Firebase", "UI Design", "Figma"],
        skillsWanted: ["Backend Development", "Node.js", "PostgreSQL"],
        githubUsername: "",
        leetcodeUsername: "",
        targetCareer: "Mobile App Developer",
        resumeLink: "",
        projectLinks: [],
        studentId: "2023IT012",
        collegeName: "NIT Trichy",
        yearOfStudy: "4th Year",
        githubToken: "",
        createdAt: "2026-01-10T00:00:00.000Z",
    },
    {
        id: "seed-5",
        name: "Rahul Verma",
        avatar: null,
        skillsKnown: ["Docker", "Kubernetes", "CI/CD", "Linux", "Terraform"],
        skillsWanted: ["Machine Learning", "Python", "Data Engineering"],
        githubUsername: "",
        leetcodeUsername: "rahul_devops",
        targetCareer: "DevOps Engineer",
        resumeLink: "",
        projectLinks: [],
        studentId: "2024EC089",
        collegeName: "BITS Pilani",
        yearOfStudy: "2nd Year",
        githubToken: "",
        createdAt: "2026-01-15T00:00:00.000Z",
    },
    {
        id: "seed-6",
        name: "Ananya Gupta",
        avatar: null,
        skillsKnown: ["HTML", "CSS", "JavaScript", "Tailwind CSS", "React"],
        skillsWanted: ["Backend", "Node.js", "MongoDB", "System Design"],
        githubUsername: "",
        leetcodeUsername: "",
        targetCareer: "Frontend Developer",
        resumeLink: "",
        projectLinks: [],
        studentId: "2025CS034",
        collegeName: "VIT Vellore",
        yearOfStudy: "1st Year",
        githubToken: "",
        createdAt: "2026-01-20T00:00:00.000Z",
    },
    {
        id: "seed-7",
        name: "Vikram Singh",
        avatar: null,
        skillsKnown: ["C++", "DSA", "Competitive Programming", "Python", "SQL"],
        skillsWanted: ["Web Development", "React", "Cloud Computing"],
        githubUsername: "",
        leetcodeUsername: "vikram_cp",
        targetCareer: "Software Engineer",
        resumeLink: "",
        projectLinks: [],
        studentId: "2024CS078",
        collegeName: "IIIT Hyderabad",
        yearOfStudy: "3rd Year",
        githubToken: "",
        createdAt: "2026-01-25T00:00:00.000Z",
    },
    {
        id: "seed-8",
        name: "Neha Reddy",
        avatar: null,
        skillsKnown: ["Marketing", "SEO", "Content Writing", "Google Ads", "Analytics"],
        skillsWanted: ["Python", "Data Analysis", "Power BI"],
        githubUsername: "",
        leetcodeUsername: "",
        targetCareer: "Digital Marketing Specialist",
        resumeLink: "",
        projectLinks: [],
        studentId: "2024BM015",
        collegeName: "SP Jain",
        yearOfStudy: "2nd Year",
        githubToken: "",
        createdAt: "2026-02-01T00:00:00.000Z",
    },
];

// ALWAYS read fresh from disk to avoid stale in-memory state across hot reloads
function loadStore() {
    try {
        if (fs.existsSync(DATA_FILE)) {
            const raw = fs.readFileSync(DATA_FILE, "utf-8");
            const data = JSON.parse(raw);
            // Ensure seed profiles are present
            const existingNames = new Set(data.users.map((u) => u.name?.toLowerCase()));
            for (const seed of SEED_PROFILES) {
                if (!existingNames.has(seed.name.toLowerCase())) {
                    data.users.push({ ...seed });
                }
            }
            // Ensure required fields
            if (!data.nextUserId) data.nextUserId = 100;
            if (!data.nextMessageId) data.nextMessageId = 1;
            if (!data.messages) data.messages = [];
            return data;
        }
    } catch (e) {
        console.error("Failed to load store:", e);
    }
    return {
        users: SEED_PROFILES.map((s) => ({ ...s })),
        messages: [],
        nextUserId: 100,
        nextMessageId: 1,
    };
}

function saveStore(data) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
    } catch (e) {
        console.error("Failed to save store:", e);
    }
}

// Every function reads from disk and writes back — no stale cache
export function getUsers(skillFilter) {
    const store = loadStore();
    let users = store.users;
    if (skillFilter) {
        const skill = skillFilter.toLowerCase();
        users = users.filter((u) =>
            (u.skillsKnown || []).some((s) => s.toLowerCase().includes(skill))
        );
    }
    return users;
}

export function getUserById(id) {
    const store = loadStore();
    return store.users.find((u) => u.id === id) || null;
}

export function addUser(userData) {
    const store = loadStore();

    // Check for existing user by ID first, then by name
    let existing = null;
    if (userData.id) {
        existing = store.users.find((u) => u.id === userData.id);
    }
    if (!existing && userData.name) {
        existing = store.users.find(
            (u) => u.name && u.name.toLowerCase() === userData.name.toLowerCase()
        );
    }

    if (existing) {
        // Merge/update the existing user
        if (userData.name) existing.name = userData.name;
        if (userData.skillsKnown?.length) existing.skillsKnown = userData.skillsKnown;
        if (userData.skillsWanted?.length) existing.skillsWanted = userData.skillsWanted;
        if (userData.githubUsername) existing.githubUsername = userData.githubUsername;
        if (userData.leetcodeUsername) existing.leetcodeUsername = userData.leetcodeUsername;
        if (userData.targetCareer) existing.targetCareer = userData.targetCareer;
        if (userData.resumeLink) existing.resumeLink = userData.resumeLink;
        if (userData.projectLinks?.length) existing.projectLinks = userData.projectLinks;
        if (userData.studentId) existing.studentId = userData.studentId;
        if (userData.collegeName) existing.collegeName = userData.collegeName;
        if (userData.yearOfStudy) existing.yearOfStudy = userData.yearOfStudy;
        if (userData.githubToken) existing.githubToken = userData.githubToken;
        if (userData.avatar) existing.avatar = userData.avatar;
        saveStore(store);
        return existing;
    }

    // New user
    const user = {
        id: userData.id || String(store.nextUserId++),
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
    saveStore(store);
    return user;
}

export function updateUser(id, userData) {
    const store = loadStore();
    const index = store.users.findIndex((u) => u.id === id);
    if (index === -1) {
        // User not found by ID — try adding them (keeps the ID)
        return addUser({ id, ...userData });
    }
    store.users[index] = { ...store.users[index], ...userData, id };
    saveStore(store);
    return store.users[index];
}

export function findMatches(userId) {
    const store = loadStore();
    const user = store.users.find((u) => u.id === userId);
    if (!user) return [];

    return store.users
        .filter((u) => u.id !== userId)
        .map((candidate) => {
            const theyTeachMe = (candidate.skillsKnown || []).filter((s) =>
                (user.skillsWanted || []).some(
                    (w) => w.toLowerCase() === s.toLowerCase()
                )
            );
            const iTeachThem = (user.skillsKnown || []).filter((s) =>
                (candidate.skillsWanted || []).some(
                    (w) => w.toLowerCase() === s.toLowerCase()
                )
            );

            const targetSkillsCount = Math.max((user.skillsWanted || []).length, 1);
            const skillOverlapScore = Math.min(100, (theyTeachMe.length / targetSkillsCount) * 100);

            const totalWanted = Math.max(
                (user.skillsWanted || []).length + (candidate.skillsWanted || []).length, 1
            );
            const mutualBenefitScore = Math.min(100,
                ((theyTeachMe.length + iTeachThem.length) / totalWanted) * 100
            );

            let githubLangScore = 0;
            if (user.githubUsername && candidate.githubUsername) {
                const userSkillsLower = (user.skillsKnown || []).map(s => s.toLowerCase());
                const candidateSkillsLower = (candidate.skillsKnown || []).map(s => s.toLowerCase());
                const sharedSkills = userSkillsLower.filter(s => candidateSkillsLower.includes(s));
                const allUniqueSkills = new Set([...userSkillsLower, ...candidateSkillsLower]);
                githubLangScore = allUniqueSkills.size > 0
                    ? Math.min(100, (sharedSkills.length / allUniqueSkills.size) * 150)
                    : 0;
            }

            const userSkillSet = new Set((user.skillsKnown || []).map(s => s.toLowerCase()));
            const candidateUniqueSkills = (candidate.skillsKnown || []).filter(
                s => !userSkillSet.has(s.toLowerCase())
            );
            const diversityScore = Math.min(100, candidateUniqueSkills.length * 15);

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
    const store = loadStore();
    const msg = {
        id: String(store.nextMessageId++),
        fromId,
        toId,
        content,
        type,
        timestamp: new Date().toISOString(),
    };
    store.messages.push(msg);
    saveStore(store);
    return msg;
}

export function getMessages(userId1, userId2) {
    const store = loadStore();
    return store.messages
        .filter(
            (m) =>
                (m.fromId === userId1 && m.toId === userId2) ||
                (m.fromId === userId2 && m.toId === userId1)
        )
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
}

export function getConversations(userId) {
    const store = loadStore();
    const seen = new Set();
    const conversations = [];

    store.messages
        .filter((m) => m.fromId === userId || m.toId === userId)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .forEach((m) => {
            const otherId = m.fromId === userId ? m.toId : m.fromId;
            if (!seen.has(otherId)) {
                seen.add(otherId);
                const otherUser = store.users.find((u) => u.id === otherId);
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

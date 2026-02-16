'use client'

import { useState, useEffect } from "react"
import {
    FiGithub, FiExternalLink, FiStar, FiGitBranch, FiCheck, FiX,
    FiPlus, FiBook, FiUser, FiFileText, FiLink, FiHash, FiAward,
    FiCode, FiActivity, FiEye, FiChevronDown, FiChevronUp, FiLogIn
} from "react-icons/fi"
import { Radar, Doughnut, Bar } from "react-chartjs-2"
import {
    Chart as ChartJS,
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend,
    ArcElement,
    CategoryScale,
    LinearScale,
    BarElement,
} from "chart.js"
import { careerProfiles, skillSuggestions } from "../../data"

ChartJS.register(
    RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend,
    ArcElement, CategoryScale, LinearScale, BarElement
)

export default function ProfilePanel({ currentUser, onUserRegistered }) {
    const [form, setForm] = useState({
        name: "",
        skillsKnown: [],
        skillsWanted: [],
        githubUsername: "",
        leetcodeUsername: "",
        targetCareer: "Full Stack Developer",
        resumeLink: "",
        projectLinks: [""],
        studentId: "",
        collegeName: "",
        yearOfStudy: "",
    })
    const [skillInput, setSkillInput] = useState("")
    const [wantedInput, setWantedInput] = useState("")
    const [addingTo, setAddingTo] = useState(null)
    const [githubData, setGithubData] = useState(null)
    const [githubLoading, setGithubLoading] = useState(false)
    const [githubToken, setGithubToken] = useState("")
    const [githubConnected, setGithubConnected] = useState(false)
    const [saving, setSaving] = useState(false)
    const [showAllRepos, setShowAllRepos] = useState(false)

    // Parse GitHub OAuth callback hash on mount
    useEffect(() => {
        if (typeof window !== "undefined") {
            const hash = window.location.hash
            if (hash.includes("github_token=")) {
                const params = new URLSearchParams(hash.substring(1))
                const token = params.get("github_token")
                const ghUser = params.get("github_user")
                const ghName = params.get("github_name")
                const ghAvatar = params.get("github_avatar")

                if (token && ghUser) {
                    setGithubToken(token)
                    setGithubConnected(true)
                    setForm((prev) => ({
                        ...prev,
                        githubUsername: ghUser,
                        name: prev.name || decodeURIComponent(ghName || ""),
                    }))
                    localStorage.setItem("github_token", token)
                    localStorage.setItem("github_username", ghUser)
                    // Clear hash
                    window.history.replaceState(null, "", window.location.pathname)
                    // Fetch data with token
                    fetchGithubData(ghUser, token)
                }
            } else {
                // Check for saved token
                const savedToken = localStorage.getItem("github_token")
                const savedUser = localStorage.getItem("github_username")
                if (savedToken && savedUser) {
                    setGithubToken(savedToken)
                    setGithubConnected(true)
                    setForm((prev) => ({
                        ...prev,
                        githubUsername: prev.githubUsername || savedUser,
                    }))
                }
            }
        }
    }, [])

    // Pre-fill form if user exists
    useEffect(() => {
        if (currentUser) {
            setForm({
                name: currentUser.name || "",
                skillsKnown: currentUser.skillsKnown || [],
                skillsWanted: currentUser.skillsWanted || [],
                githubUsername: currentUser.githubUsername || "",
                leetcodeUsername: currentUser.leetcodeUsername || "",
                targetCareer: currentUser.targetCareer || "Full Stack Developer",
                resumeLink: currentUser.resumeLink || "",
                projectLinks: currentUser.projectLinks?.length > 0 ? currentUser.projectLinks : [""],
                studentId: currentUser.studentId || "",
                collegeName: currentUser.collegeName || "",
                yearOfStudy: currentUser.yearOfStudy || "",
            })
            if (currentUser.githubUsername) {
                const savedToken = localStorage.getItem("github_token")
                if (savedToken) {
                    setGithubToken(savedToken)
                    setGithubConnected(true)
                }
                fetchGithubData(currentUser.githubUsername, savedToken || "")
            }
        }
    }, [currentUser])

    const fetchGithubData = async (username, token = "") => {
        if (!username) return
        setGithubLoading(true)
        try {
            const headers = {}
            if (token) {
                headers.Authorization = `Bearer ${token}`
            }
            const res = await fetch(`/api/guide-barter/github/${username}`, { headers })
            if (res.ok) {
                const data = await res.json()
                setGithubData(data)
            }
        } catch (e) {
            console.error("Failed to fetch GitHub data", e)
        }
        setGithubLoading(false)
    }

    const handleGithubLogin = () => {
        window.location.href = "/api/auth/github"
    }

    const handleGithubDisconnect = () => {
        setGithubToken("")
        setGithubConnected(false)
        setGithubData(null)
        localStorage.removeItem("github_token")
        localStorage.removeItem("github_username")
        setForm((prev) => ({ ...prev, githubUsername: "" }))
    }

    const addSkill = (skill, type) => {
        if (!skill.trim()) return
        const key = type === "known" ? "skillsKnown" : "skillsWanted"
        if (!form[key].includes(skill.trim())) {
            setForm({ ...form, [key]: [...form[key], skill.trim()] })
        }
        if (type === "known") setSkillInput("")
        else setWantedInput("")
        setAddingTo(null)
    }

    const removeSkill = (skill, type) => {
        const key = type === "known" ? "skillsKnown" : "skillsWanted"
        setForm({ ...form, [key]: form[key].filter((s) => s !== skill) })
    }

    const addProjectLink = () => {
        setForm({ ...form, projectLinks: [...form.projectLinks, ""] })
    }

    const updateProjectLink = (index, value) => {
        const updated = [...form.projectLinks]
        updated[index] = value
        setForm({ ...form, projectLinks: updated })
    }

    const removeProjectLink = (index) => {
        const updated = form.projectLinks.filter((_, i) => i !== index)
        setForm({ ...form, projectLinks: updated.length > 0 ? updated : [""] })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!form.name.trim() || form.skillsKnown.length === 0) {
            alert("Please enter your name and at least one skill you know.")
            return
        }
        setSaving(true)
        try {
            const submitData = {
                ...form,
                projectLinks: form.projectLinks.filter((l) => l.trim()),
                githubToken,
            }
            if (currentUser?.id) submitData.id = currentUser.id

            const res = await fetch("/api/guide-barter/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(submitData),
            })
            const data = await res.json()
            onUserRegistered(data.user)
            if (form.githubUsername && !githubData) {
                fetchGithubData(form.githubUsername, githubToken)
            }
        } catch (e) {
            console.error("Failed to save profile", e)
        }
        setSaving(false)
    }

    // --- Chart Data (DYNAMIC from GitHub) ---
    const targetCareerData = careerProfiles[form.targetCareer]
    const radarSkills = targetCareerData?.skills || []

    // Dynamic skill levels from GitHub data
    const getSkillLevel = (skillName) => {
        if (!githubData?.skillLevels) {
            // Fallback: check if user listed the skill
            return form.skillsKnown.some(
                (k) => k.toLowerCase() === skillName.toLowerCase()
            ) ? 40 : 0
        }
        // Try exact match first
        const level = githubData.skillLevels[skillName]
        if (level !== undefined) return level
        // Try case-insensitive match
        const key = Object.keys(githubData.skillLevels).find(
            (k) => k.toLowerCase() === skillName.toLowerCase()
        )
        if (key) return githubData.skillLevels[key]
        // Check if user listed it (no GitHub data for it)
        return form.skillsKnown.some(
            (k) => k.toLowerCase() === skillName.toLowerCase()
        ) ? 30 : 0
    }

    const radarChartData = {
        labels: radarSkills,
        datasets: [
            {
                label: "Your Level (from GitHub)",
                data: radarSkills.map(getSkillLevel),
                backgroundColor: "rgba(255, 136, 91, 0.2)",
                borderColor: "#FF885B",
                borderWidth: 2,
                pointBackgroundColor: "#FF885B",
                pointRadius: 4,
            },
            {
                label: `${form.targetCareer} Required`,
                data: radarSkills.map(() => 75),
                backgroundColor: "rgba(108, 99, 255, 0.1)",
                borderColor: "#6C63FF",
                borderWidth: 2,
                borderDash: [5, 5],
                pointBackgroundColor: "#6C63FF",
                pointRadius: 3,
            },
        ],
    }

    const radarOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: "bottom",
                labels: { font: { family: "var(--font-sora)", size: 11 }, padding: 16 },
            },
            tooltip: {
                callbacks: {
                    label: (ctx) => `${ctx.dataset.label}: ${ctx.raw}%`,
                },
            },
        },
        scales: {
            r: {
                beginAtZero: true,
                max: 100,
                ticks: { stepSize: 20, display: false },
                grid: { color: "rgba(0,0,0,0.06)" },
                pointLabels: { font: { family: "var(--font-sora)", size: 10 } },
            },
        },
    }

    // Language doughnut chart
    const doughnutData = githubData?.topLanguages?.length > 0
        ? {
            labels: githubData.topLanguages.slice(0, 10).map((l) => l.name),
            datasets: [
                {
                    data: githubData.topLanguages.slice(0, 10).map((l) => l.percentage || l.count),
                    backgroundColor: [
                        "#FF885B", "#6C63FF", "#00C9A7", "#FF6B6B", "#4ECDC4",
                        "#FFE66D", "#A78BFA", "#F472B6", "#34D399", "#FBBF24",
                    ],
                    borderWidth: 0,
                },
            ],
        }
        : null

    const doughnutOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: "bottom",
                labels: { font: { family: "var(--font-sora)", size: 11 }, padding: 12 },
            },
            tooltip: {
                callbacks: {
                    label: (ctx) => {
                        const lang = githubData?.topLanguages?.[ctx.dataIndex]
                        if (lang?.bytes) {
                            const kb = (lang.bytes / 1024).toFixed(1)
                            return `${lang.name}: ${lang.percentage}% (${kb} KB)`
                        }
                        return `${ctx.label}: ${ctx.raw}%`
                    },
                },
            },
        },
        cutout: "60%",
    }

    // Dynamic bar gap chart
    const barChartData = {
        labels: radarSkills,
        datasets: [
            {
                label: "Your Level",
                data: radarSkills.map(getSkillLevel),
                backgroundColor: radarSkills.map((s) =>
                    getSkillLevel(s) >= 75 ? "#00C9A7" : getSkillLevel(s) >= 40 ? "#FF885B" : "#FF6B6B"
                ),
                borderRadius: 6,
            },
            {
                label: "Required Level",
                data: radarSkills.map(() => 75),
                backgroundColor: "rgba(108, 99, 255, 0.2)",
                borderColor: "#6C63FF",
                borderWidth: 1,
                borderRadius: 6,
            },
        ],
    }

    const barOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: "bottom",
                labels: { font: { family: "var(--font-sora)", size: 11 }, padding: 16 },
            },
            tooltip: {
                callbacks: {
                    label: (ctx) => `${ctx.dataset.label}: ${ctx.raw}%`,
                },
            },
        },
        scales: {
            x: {
                ticks: { font: { family: "var(--font-sora)", size: 10 } },
                grid: { display: false },
            },
            y: {
                beginAtZero: true,
                max: 100,
                ticks: {
                    font: { family: "var(--font-sora)", size: 10 },
                    callback: (v) => `${v}%`,
                },
                grid: { color: "rgba(0,0,0,0.04)" },
            },
        },
    }

    const missingSkills = radarSkills.filter((s) => getSkillLevel(s) < 20)
    const strongSkills = radarSkills.filter((s) => getSkillLevel(s) >= 75)

    const activeSuggestions = (addingTo === "known" ? skillInput : wantedInput)
        ? skillSuggestions
            .filter((s) =>
                s.toLowerCase().includes(
                    (addingTo === "known" ? skillInput : wantedInput).toLowerCase()
                )
            )
            .filter((s) =>
                !(addingTo === "known" ? form.skillsKnown : form.skillsWanted).includes(s)
            )
            .slice(0, 6)
        : []

    const displayedRepos = showAllRepos
        ? githubData?.repos
        : githubData?.repos?.slice(0, 6)

    return (
        <div className="space-y-8">
            {/* GitHub Authentication Section */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-syne font-semibold text-xl text-neutral-900 flex items-center gap-2">
                        <FiGithub className="size-5" />
                        GitHub Authentication
                    </h3>
                    {githubConnected && (
                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-sora font-semibold">
                            <FiCheck className="size-3" /> Connected
                        </span>
                    )}
                </div>
                {githubConnected ? (
                    <div className="flex items-center justify-between flex-wrap gap-3">
                        <div className="flex items-center gap-3">
                            {githubData?.profile?.avatar && (
                                <img
                                    src={githubData.profile.avatar}
                                    alt="GitHub avatar"
                                    className="size-10 rounded-full border border-neutral-200"
                                />
                            )}
                            <div>
                                <p className="font-sora text-sm font-medium text-neutral-900">
                                    {githubData?.profile?.name || form.githubUsername}
                                </p>
                                <p className="text-xs text-neutral-400 font-sora">
                                    @{form.githubUsername} · Authenticated via GitHub OAuth
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleGithubDisconnect}
                            className="px-4 py-2 rounded-full border border-neutral-200 text-neutral-500 text-xs font-sora hover:border-red-300 hover:text-red-500 transition-colors"
                        >
                            Disconnect
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <button
                            onClick={handleGithubLogin}
                            className="flex items-center gap-2 px-6 py-3 bg-neutral-900 text-white rounded-full font-sora text-sm font-medium hover:bg-[#FF885B] transition-colors"
                        >
                            <FiLogIn className="size-4" />
                            Login with GitHub
                        </button>
                        <p className="text-xs text-neutral-400 font-sora max-w-sm">
                            Connect your GitHub account for higher API limits, private repo access, and accurate skill analysis.
                        </p>
                    </div>
                )}
            </div>

            {/* Registration / Edit Form */}
            <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
                <h3 className="font-syne font-semibold text-xl text-neutral-900 mb-5">
                    {currentUser ? "Edit Your Profile" : "Create Your Profile"}
                </h3>

                {/* Personal Info Section */}
                <div className="mb-6">
                    <p className="text-xs text-neutral-400 font-sora uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <FiUser className="size-3" /> Personal Information
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs text-neutral-500 font-sora mb-1">Your Name *</label>
                            <input
                                type="text"
                                className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 bg-neutral-50 font-sora text-sm text-neutral-700 outline-none focus:border-[#FF885B] transition-colors"
                                placeholder="Enter your name"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-neutral-500 font-sora mb-1">Target Career</label>
                            <select
                                className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 bg-neutral-50 font-sora text-sm text-neutral-700 outline-none focus:border-[#FF885B] transition-colors"
                                value={form.targetCareer}
                                onChange={(e) => setForm({ ...form, targetCareer: e.target.value })}
                            >
                                {Object.keys(careerProfiles).map((career) => (
                                    <option key={career} value={career}>{career}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Student Info Section */}
                <div className="mb-6">
                    <p className="text-xs text-neutral-400 font-sora uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <FiHash className="size-3" /> Student Information
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs text-neutral-500 font-sora mb-1">Student ID / Roll No.</label>
                            <input
                                type="text"
                                className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 bg-neutral-50 font-sora text-sm text-neutral-700 outline-none focus:border-[#FF885B] transition-colors"
                                placeholder="e.g. 2024CS001"
                                value={form.studentId}
                                onChange={(e) => setForm({ ...form, studentId: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-neutral-500 font-sora mb-1">College / University</label>
                            <input
                                type="text"
                                className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 bg-neutral-50 font-sora text-sm text-neutral-700 outline-none focus:border-[#FF885B] transition-colors"
                                placeholder="e.g. IIT Delhi"
                                value={form.collegeName}
                                onChange={(e) => setForm({ ...form, collegeName: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-neutral-500 font-sora mb-1">Year of Study</label>
                            <select
                                className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 bg-neutral-50 font-sora text-sm text-neutral-700 outline-none focus:border-[#FF885B] transition-colors"
                                value={form.yearOfStudy}
                                onChange={(e) => setForm({ ...form, yearOfStudy: e.target.value })}
                            >
                                <option value="">Select Year</option>
                                <option value="1st Year">1st Year</option>
                                <option value="2nd Year">2nd Year</option>
                                <option value="3rd Year">3rd Year</option>
                                <option value="4th Year">4th Year</option>
                                <option value="5th Year">5th Year</option>
                                <option value="Alumni">Alumni</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Platform Links Section */}
                <div className="mb-6">
                    <p className="text-xs text-neutral-400 font-sora uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <FiLink className="size-3" /> Platform Profiles
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs text-neutral-500 font-sora mb-1">
                                <FiGithub className="inline mr-1 size-3" /> GitHub Username
                            </label>
                            <input
                                type="text"
                                className={`w-full px-4 py-2.5 rounded-lg border bg-neutral-50 font-sora text-sm outline-none transition-colors ${githubConnected
                                        ? "border-emerald-200 text-emerald-700 bg-emerald-50"
                                        : "border-neutral-200 text-neutral-700 focus:border-[#FF885B]"
                                    }`}
                                placeholder="e.g. octocat"
                                value={form.githubUsername}
                                onChange={(e) => setForm({ ...form, githubUsername: e.target.value })}
                                readOnly={githubConnected}
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-neutral-500 font-sora mb-1">LeetCode Username</label>
                            <input
                                type="text"
                                className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 bg-neutral-50 font-sora text-sm text-neutral-700 outline-none focus:border-[#FF885B] transition-colors"
                                placeholder="e.g. leetcoder123"
                                value={form.leetcodeUsername}
                                onChange={(e) => setForm({ ...form, leetcodeUsername: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                {/* Resume & Project Links */}
                <div className="mb-6">
                    <p className="text-xs text-neutral-400 font-sora uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <FiFileText className="size-3" /> Resume & Projects
                    </p>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs text-neutral-500 font-sora mb-1">Resume Link (Google Drive, etc.)</label>
                            <input
                                type="url"
                                className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 bg-neutral-50 font-sora text-sm text-neutral-700 outline-none focus:border-[#FF885B] transition-colors"
                                placeholder="https://drive.google.com/your-resume"
                                value={form.resumeLink}
                                onChange={(e) => setForm({ ...form, resumeLink: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-neutral-500 font-sora mb-1">Project / Portfolio Links</label>
                            {form.projectLinks.map((link, idx) => (
                                <div key={idx} className="flex items-center gap-2 mb-2">
                                    <input
                                        type="url"
                                        className="flex-1 px-4 py-2.5 rounded-lg border border-neutral-200 bg-neutral-50 font-sora text-sm text-neutral-700 outline-none focus:border-[#FF885B] transition-colors"
                                        placeholder={`https://project-${idx + 1}.example.com`}
                                        value={link}
                                        onChange={(e) => updateProjectLink(idx, e.target.value)}
                                    />
                                    {form.projectLinks.length > 1 && (
                                        <button type="button" onClick={() => removeProjectLink(idx)}
                                            className="p-2 text-neutral-400 hover:text-red-500 transition-colors">
                                            <FiX className="size-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button type="button" onClick={addProjectLink}
                                className="flex items-center gap-1 text-xs font-sora text-[#FF885B] hover:underline mt-1">
                                <FiPlus className="size-3" /> Add another link
                            </button>
                        </div>
                    </div>
                </div>

                {/* Skills Known */}
                <div className="mb-6">
                    <p className="text-xs text-neutral-400 font-sora uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <FiCode className="size-3" /> Skills
                    </p>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs text-neutral-500 font-sora mb-1">Skills You Know *</label>
                            <div className="flex flex-wrap gap-2 mb-2">
                                {form.skillsKnown.map((skill) => (
                                    <span key={skill} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-sora font-medium">
                                        {skill}
                                        <button type="button" onClick={() => removeSkill(skill, "known")}>
                                            <FiX className="size-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                            <div className="relative">
                                <div className="flex items-center gap-2">
                                    <input type="text"
                                        className="flex-1 px-4 py-2 rounded-lg border border-neutral-200 bg-neutral-50 font-sora text-sm text-neutral-700 outline-none focus:border-[#FF885B] transition-colors"
                                        placeholder="Type a skill and press Enter"
                                        value={skillInput}
                                        onChange={(e) => { setSkillInput(e.target.value); setAddingTo("known") }}
                                        onFocus={() => setAddingTo("known")}
                                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(skillInput, "known") } }}
                                    />
                                    <button type="button" onClick={() => addSkill(skillInput, "known")}
                                        className="p-2 rounded-lg bg-neutral-900 text-white hover:bg-[#FF885B] transition-colors">
                                        <FiPlus className="size-4" />
                                    </button>
                                </div>
                                {addingTo === "known" && activeSuggestions.length > 0 && (
                                    <div className="absolute top-full mt-1 left-0 right-0 bg-white rounded-lg shadow-lg border border-neutral-100 overflow-hidden z-20">
                                        {activeSuggestions.map((s) => (
                                            <button type="button" key={s}
                                                className="w-full text-left px-4 py-2 text-sm font-sora text-neutral-600 hover:bg-neutral-50 hover:text-emerald-600"
                                                onMouseDown={() => addSkill(s, "known")}>
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs text-neutral-500 font-sora mb-1">Skills You Want to Learn</label>
                            <div className="flex flex-wrap gap-2 mb-2">
                                {form.skillsWanted.map((skill) => (
                                    <span key={skill} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-sora font-medium">
                                        {skill}
                                        <button type="button" onClick={() => removeSkill(skill, "wanted")}>
                                            <FiX className="size-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                            <div className="relative">
                                <div className="flex items-center gap-2">
                                    <input type="text"
                                        className="flex-1 px-4 py-2 rounded-lg border border-neutral-200 bg-neutral-50 font-sora text-sm text-neutral-700 outline-none focus:border-[#FF885B] transition-colors"
                                        placeholder="Type a skill and press Enter"
                                        value={wantedInput}
                                        onChange={(e) => { setWantedInput(e.target.value); setAddingTo("wanted") }}
                                        onFocus={() => setAddingTo("wanted")}
                                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(wantedInput, "wanted") } }}
                                    />
                                    <button type="button" onClick={() => addSkill(wantedInput, "wanted")}
                                        className="p-2 rounded-lg bg-neutral-900 text-white hover:bg-[#FF885B] transition-colors">
                                        <FiPlus className="size-4" />
                                    </button>
                                </div>
                                {addingTo === "wanted" && activeSuggestions.length > 0 && (
                                    <div className="absolute top-full mt-1 left-0 right-0 bg-white rounded-lg shadow-lg border border-neutral-100 overflow-hidden z-20">
                                        {activeSuggestions.map((s) => (
                                            <button type="button" key={s}
                                                className="w-full text-left px-4 py-2 text-sm font-sora text-neutral-600 hover:bg-neutral-50 hover:text-blue-600"
                                                onMouseDown={() => addSkill(s, "wanted")}>
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <button type="submit" disabled={saving}
                    className="px-8 py-3 rounded-full bg-neutral-900 text-white font-sora text-sm font-medium hover:bg-[#FF885B] transition-colors disabled:opacity-50">
                    {saving ? "Saving..." : currentUser ? "Update Profile" : "Create Profile"}
                </button>
            </form>

            {/* GitHub Scorecard */}
            {githubData?.scorecard && (
                <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
                    <h3 className="font-syne font-semibold text-xl text-neutral-900 mb-5 flex items-center gap-2">
                        <FiActivity className="size-5" />
                        GitHub Scorecard
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {[
                            { label: "Total Repos", value: githubData.scorecard.totalRepos, icon: <FiBook className="size-5" />, color: "from-[#FF885B] to-[#FF6B3D]" },
                            { label: "Original Repos", value: githubData.scorecard.originalRepos, icon: <FiCode className="size-5" />, color: "from-[#6C63FF] to-[#5A54E0]" },
                            { label: "Total Stars", value: githubData.scorecard.totalStars, icon: <FiStar className="size-5" />, color: "from-[#FFE66D] to-[#FFC107]" },
                            { label: "Total Forks", value: githubData.scorecard.totalForks, icon: <FiGitBranch className="size-5" />, color: "from-[#00C9A7] to-[#00A388]" },
                            { label: "Languages", value: githubData.scorecard.totalLanguages, icon: <FiAward className="size-5" />, color: "from-[#F472B6] to-[#EC4899]" },
                            { label: "Forked Repos", value: githubData.scorecard.forkedRepos, icon: <FiGitBranch className="size-5" />, color: "from-[#A78BFA] to-[#8B5CF6]" },
                            { label: "Top Language", value: githubData.scorecard.topLanguage, icon: <FiCode className="size-5" />, color: "from-[#34D399] to-[#10B981]" },
                            { label: "Account Age", value: githubData.scorecard.accountAge, icon: <FiUser className="size-5" />, color: "from-[#FBBF24] to-[#F59E0B]" },
                            { label: "Watchers", value: githubData.scorecard.totalWatchers, icon: <FiEye className="size-5" />, color: "from-[#4ECDC4] to-[#26A69A]" },
                            { label: "Followers", value: githubData.profile?.followers || 0, icon: <FiUser className="size-5" />, color: "from-[#FF6B6B] to-[#EF4444]" },
                        ].map((stat) => (
                            <div key={stat.label} className="relative overflow-hidden rounded-xl bg-neutral-50 p-4 group hover:scale-[1.02] transition-transform">
                                <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${stat.color}`} />
                                <div className="text-neutral-400 mb-2">{stat.icon}</div>
                                <p className="font-bebas text-2xl text-neutral-900">{stat.value}</p>
                                <p className="text-[10px] text-neutral-400 font-sora uppercase tracking-wider">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* GitHub Profile & Languages */}
            {githubData && (
                <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="font-syne font-semibold text-xl text-neutral-900 flex items-center gap-2">
                            <FiGithub className="size-5" />
                            GitHub Analytics
                        </h3>
                        <button onClick={() => fetchGithubData(form.githubUsername, githubToken)}
                            className="text-xs font-sora text-[#FF885B] hover:underline">
                            Refresh
                        </button>
                    </div>

                    {githubLoading ? (
                        <div className="flex items-center justify-center py-10">
                            <div className="size-8 border-2 border-neutral-300 border-t-[#FF885B] rounded-full animate-spin" />
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Profile Overview */}
                            <div className="flex items-center gap-4 pb-4 border-b border-neutral-100">
                                {githubData.profile.avatar && (
                                    <img src={githubData.profile.avatar} alt={githubData.profile.name}
                                        className="size-16 rounded-full border-2 border-neutral-200" />
                                )}
                                <div className="min-w-0">
                                    <h4 className="font-syne font-semibold text-lg">{githubData.profile.name || githubData.profile.login}</h4>
                                    <p className="text-sm text-neutral-500 font-sora truncate">{githubData.profile.bio || "No bio"}</p>
                                    <div className="flex items-center gap-4 mt-1 text-xs text-neutral-400 font-sora flex-wrap">
                                        <span>{githubData.profile.publicRepos} repos</span>
                                        <span>{githubData.profile.followers} followers</span>
                                        <span>{githubData.profile.following} following</span>
                                        {githubData.profile.location && <span>📍 {githubData.profile.location}</span>}
                                    </div>
                                </div>
                            </div>

                            {/* Charts Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {doughnutData && (
                                    <div className="bg-neutral-50 rounded-xl p-5">
                                        <h4 className="font-syne font-medium text-sm text-neutral-700 mb-3">
                                            Top Languages (by code volume)
                                        </h4>
                                        <div className="max-w-[280px] mx-auto">
                                            <Doughnut data={doughnutData} options={doughnutOptions} />
                                        </div>
                                    </div>
                                )}

                                {/* Language Breakdown */}
                                <div className="bg-neutral-50 rounded-xl p-5">
                                    <h4 className="font-syne font-medium text-sm text-neutral-700 mb-3">Language Breakdown</h4>
                                    <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-2">
                                        {githubData.topLanguages.map((lang, i) => (
                                            <div key={lang.name}>
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-xs font-sora font-medium text-neutral-700">{lang.name}</span>
                                                    <span className="text-[10px] font-sora text-neutral-400">
                                                        {lang.percentage}% · {lang.count} repos · {(lang.bytes / 1024).toFixed(1)} KB
                                                    </span>
                                                </div>
                                                <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full transition-all duration-500"
                                                        style={{
                                                            width: `${lang.percentage}%`,
                                                            backgroundColor: [
                                                                "#FF885B", "#6C63FF", "#00C9A7", "#FF6B6B", "#4ECDC4",
                                                                "#FFE66D", "#A78BFA", "#F472B6", "#34D399", "#FBBF24",
                                                            ][i % 10],
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* ALL Repositories */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="font-syne font-medium text-sm text-neutral-700">
                                        All Repositories ({githubData.repos?.length || 0})
                                    </h4>
                                    {githubData.repos?.length > 6 && (
                                        <button onClick={() => setShowAllRepos(!showAllRepos)}
                                            className="flex items-center gap-1 text-xs font-sora text-[#FF885B] hover:underline">
                                            {showAllRepos ? <><FiChevronUp className="size-3" /> Show Less</> : <><FiChevronDown className="size-3" /> View All</>}
                                        </button>
                                    )}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[600px] overflow-y-auto pr-1">
                                    {displayedRepos?.map((repo) => (
                                        <a key={repo.name} href={repo.url} target="_blank" rel="noopener noreferrer"
                                            className="block p-4 bg-neutral-50 rounded-lg border border-neutral-100 hover:border-[#FF885B] transition-colors group">
                                            <div className="flex items-start justify-between">
                                                <h5 className="font-sora text-sm font-medium text-neutral-800 group-hover:text-[#FF885B] transition-colors truncate">
                                                    {repo.name}
                                                </h5>
                                                <div className="flex items-center gap-1 shrink-0 ml-2">
                                                    {repo.isForked && (
                                                        <span className="px-1.5 py-0.5 rounded text-[9px] bg-neutral-200 text-neutral-500">fork</span>
                                                    )}
                                                    <FiExternalLink className="size-3 text-neutral-400" />
                                                </div>
                                            </div>
                                            {repo.description && (
                                                <p className="text-xs text-neutral-400 font-sora mt-1 line-clamp-2">{repo.description}</p>
                                            )}
                                            {repo.topics?.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-2">
                                                    {repo.topics.slice(0, 4).map((t) => (
                                                        <span key={t} className="px-1.5 py-0.5 rounded text-[9px] bg-blue-50 text-blue-600">{t}</span>
                                                    ))}
                                                </div>
                                            )}
                                            <div className="flex items-center gap-3 mt-2 text-xs text-neutral-400 font-sora">
                                                {repo.language && (
                                                    <span className="flex items-center gap-1">
                                                        <span className="size-2 rounded-full bg-[#FF885B]" />{repo.language}
                                                    </span>
                                                )}
                                                <span className="flex items-center gap-1"><FiStar className="size-3" /> {repo.stars}</span>
                                                <span className="flex items-center gap-1"><FiGitBranch className="size-3" /> {repo.forks}</span>
                                                {repo.homepage && (
                                                    <span className="text-[#FF885B]">🔗 Live</span>
                                                )}
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Skill Comparison Charts */}
            {currentUser && form.skillsKnown.length > 0 && (
                <div className="space-y-6">
                    {/* Radar Chart */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
                        <h3 className="font-syne font-semibold text-xl text-neutral-900 mb-1">
                            Skill Radar — vs {form.targetCareer}
                        </h3>
                        <p className="text-xs text-neutral-400 font-sora mb-4">
                            {githubData
                                ? "Skill levels calculated dynamically from your GitHub repository language data."
                                : "Connect GitHub for accurate skill levels. Currently using estimated values."}
                        </p>
                        {githubData && (
                            <div className="flex flex-wrap gap-2 mb-4">
                                {strongSkills.length > 0 && (
                                    <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-sora">
                                        ✅ Strong: {strongSkills.join(", ")}
                                    </span>
                                )}
                            </div>
                        )}
                        <div className="max-w-[480px] mx-auto">
                            <Radar data={radarChartData} options={radarOptions} />
                        </div>
                    </div>

                    {/* Bar Chart - Skill Gap */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
                        <h3 className="font-syne font-semibold text-xl text-neutral-900 mb-1">
                            Skill Gap Analysis
                        </h3>
                        <p className="text-xs text-neutral-400 font-sora mb-4">
                            Your current level vs. required level for {form.targetCareer}.
                            <span className="ml-2">
                                🟢 &ge;75% | 🟠 40-74% | 🔴 &lt;40%
                            </span>
                        </p>
                        <Bar data={barChartData} options={barOptions} />
                        {missingSkills.length > 0 && (
                            <div className="mt-4 p-4 bg-amber-50 rounded-xl">
                                <p className="text-xs font-sora font-semibold text-amber-700 mb-2">
                                    ⚠️ Skills to Develop ({missingSkills.length})
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                    {missingSkills.map((s) => (
                                        <span key={s} className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-sora font-medium">{s}</span>
                                    ))}
                                </div>
                                <p className="text-[10px] text-amber-500 font-sora mt-2">
                                    Tip: Find peers who know these skills in the Discover tab!
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* LeetCode Link */}
            {currentUser?.leetcodeUsername && (
                <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
                    <h3 className="font-syne font-semibold text-xl text-neutral-900 mb-3">LeetCode Profile</h3>
                    <a href={`https://leetcode.com/${currentUser.leetcodeUsername}`} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-neutral-900 text-white rounded-full font-sora text-sm hover:bg-[#FF885B] transition-colors">
                        View on LeetCode <FiExternalLink className="size-3.5" />
                    </a>
                </div>
            )}

            {/* Resume & Project Links Display */}
            {currentUser && (currentUser.resumeLink || currentUser.projectLinks?.length > 0) && (
                <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
                    <h3 className="font-syne font-semibold text-xl text-neutral-900 mb-4 flex items-center gap-2">
                        <FiFileText className="size-5" />
                        Documents & Projects
                    </h3>
                    <div className="space-y-3">
                        {currentUser.resumeLink && (
                            <a href={currentUser.resumeLink} target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg border border-neutral-100 hover:border-[#FF885B] transition-colors group">
                                <FiFileText className="size-5 text-[#FF885B]" />
                                <div>
                                    <p className="text-sm font-sora font-medium text-neutral-800 group-hover:text-[#FF885B]">Resume</p>
                                    <p className="text-xs text-neutral-400 font-sora truncate max-w-md">{currentUser.resumeLink}</p>
                                </div>
                                <FiExternalLink className="size-3.5 text-neutral-400 ml-auto" />
                            </a>
                        )}
                        {currentUser.projectLinks?.map((link, i) => (
                            <a key={i} href={link} target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg border border-neutral-100 hover:border-[#FF885B] transition-colors group">
                                <FiLink className="size-5 text-[#6C63FF]" />
                                <div>
                                    <p className="text-sm font-sora font-medium text-neutral-800 group-hover:text-[#FF885B]">Project {i + 1}</p>
                                    <p className="text-xs text-neutral-400 font-sora truncate max-w-md">{link}</p>
                                </div>
                                <FiExternalLink className="size-3.5 text-neutral-400 ml-auto" />
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

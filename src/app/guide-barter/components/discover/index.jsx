'use client'

import { useState, useEffect, useMemo } from "react"
import { FiSearch, FiUsers, FiAlertCircle, FiFilter } from "react-icons/fi"
import UserCard from "../user-card"
import { skillSuggestions } from "../../data"

// Simple in-memory cache for GitHub data
const githubCache = {}

// Client-side match computation — works regardless of server state
function computeMatches(currentUser, users) {
    if (!currentUser?.skillsKnown?.length && !currentUser?.skillsWanted?.length) return []

    return users
        .filter((u) => u.id !== currentUser.id && u.name?.toLowerCase() !== currentUser.name?.toLowerCase())
        .map((candidate) => {
            const theyTeachMe = (candidate.skillsKnown || []).filter((s) =>
                (currentUser.skillsWanted || []).some(
                    (w) => w.toLowerCase() === s.toLowerCase()
                )
            )
            const iTeachThem = (currentUser.skillsKnown || []).filter((s) =>
                (candidate.skillsWanted || []).some(
                    (w) => w.toLowerCase() === s.toLowerCase()
                )
            )

            const targetSkillsCount = Math.max((currentUser.skillsWanted || []).length, 1)
            const skillOverlapScore = Math.min(100, (theyTeachMe.length / targetSkillsCount) * 100)

            const totalWanted = Math.max(
                (currentUser.skillsWanted || []).length + (candidate.skillsWanted || []).length, 1
            )
            const mutualBenefitScore = Math.min(100,
                ((theyTeachMe.length + iTeachThem.length) / totalWanted) * 100
            )

            let githubLangScore = 0
            if (currentUser.githubUsername && candidate.githubUsername) {
                const userSkillsLower = (currentUser.skillsKnown || []).map(s => s.toLowerCase())
                const candidateSkillsLower = (candidate.skillsKnown || []).map(s => s.toLowerCase())
                const sharedSkills = userSkillsLower.filter(s => candidateSkillsLower.includes(s))
                const allUniqueSkills = new Set([...userSkillsLower, ...candidateSkillsLower])
                githubLangScore = allUniqueSkills.size > 0
                    ? Math.min(100, (sharedSkills.length / allUniqueSkills.size) * 150)
                    : 0
            }

            const userSkillSet = new Set((currentUser.skillsKnown || []).map(s => s.toLowerCase()))
            const candidateUniqueSkills = (candidate.skillsKnown || []).filter(
                s => !userSkillSet.has(s.toLowerCase())
            )
            const diversityScore = Math.min(100, candidateUniqueSkills.length * 15)

            const matchScore = Math.round(
                skillOverlapScore * 0.4 +
                mutualBenefitScore * 0.3 +
                githubLangScore * 0.2 +
                diversityScore * 0.1
            )

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
            }
        })
        .filter((m) => m.matchScore > 0)
        .sort((a, b) => b.matchScore - a.matchScore)
}

export default function DiscoverPanel({ currentUser }) {
    const [searchQuery, setSearchQuery] = useState("")
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [mode, setMode] = useState("all")
    const [sortBy, setSortBy] = useState("default")
    const [githubDataMap, setGithubDataMap] = useState({})

    // Compute matches client-side so they're always available instantly
    const matches = useMemo(() => {
        if (!currentUser) return []
        return computeMatches(currentUser, users)
    }, [currentUser, users])

    // Fetch all users on mount + auto-refresh every 5 sec for new profiles
    useEffect(() => {
        let cancelled = false
        const load = async () => {
            setLoading(true)
            const data = await fetchUsers()
            if (!cancelled && data.length === 0) {
                await new Promise((r) => setTimeout(r, 300))
                await fetchUsers()
            }
            setLoading(false)
        }
        load()
        // Auto-refresh users so new profiles show up
        const interval = setInterval(() => {
            if (!cancelled) fetchUsers()
        }, 5000)
        return () => { cancelled = true; clearInterval(interval) }
    }, [])

    // Batch-fetch GitHub data
    useEffect(() => {
        if (users.length === 0) return
        const ghUsers = users.filter((u) => u.githubUsername && !githubCache[u.githubUsername])
        if (ghUsers.length === 0) {
            const map = {}
            users.forEach((u) => {
                if (u.githubUsername && githubCache[u.githubUsername]) {
                    map[u.githubUsername] = githubCache[u.githubUsername]
                }
            })
            setGithubDataMap((prev) => ({ ...prev, ...map }))
            return
        }
        Promise.allSettled(
            ghUsers.map((u) =>
                fetch(`/api/guide-barter/github/${u.githubUsername}`)
                    .then((r) => r.ok ? r.json() : null)
                    .then((data) => {
                        if (data) {
                            githubCache[u.githubUsername] = data
                            return { username: u.githubUsername, data }
                        }
                        return null
                    })
                    .catch(() => null)
            )
        ).then((results) => {
            const map = {}
            results.forEach((r) => {
                if (r.status === "fulfilled" && r.value) {
                    map[r.value.username] = r.value.data
                }
            })
            setGithubDataMap((prev) => ({ ...prev, ...map }))
        })
    }, [users])

    const fetchUsers = async (skill = "") => {
        try {
            const url = skill
                ? `/api/guide-barter/users?skill=${encodeURIComponent(skill)}`
                : "/api/guide-barter/users"
            const res = await fetch(url)
            const data = await res.json()
            const fetched = data.users || []
            setUsers(fetched)
            return fetched
        } catch (e) {
            console.error("Failed to fetch users", e)
            return []
        }
    }

    const handleSearch = (e) => {
        e.preventDefault()
        setLoading(true)
        fetchUsers(searchQuery).then(() => setLoading(false))
        setShowSuggestions(false)
    }

    const handleSendCollab = async (targetUser) => {
        if (!currentUser?.id) {
            alert("Please create your profile first (My Profile tab)")
            return
        }
        try {
            await fetch("/api/guide-barter/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    fromId: currentUser.id,
                    toId: targetUser.id,
                    content: `Hey ${targetUser.name}! I'd love to exchange skills with you. I know ${currentUser.skillsKnown?.slice(0, 3).join(", ")} and want to learn ${currentUser.skillsWanted?.slice(0, 3).join(", ")}. Let's collaborate!`,
                    type: "collab_request",
                }),
            })
            alert(`Collab request sent to ${targetUser.name}! Check the Messages tab.`)
        } catch (e) {
            console.error("Failed to send collab request", e)
        }
    }

    const filteredSuggestions = searchQuery
        ? skillSuggestions.filter((s) =>
            s.toLowerCase().includes(searchQuery.toLowerCase())
        ).slice(0, 8)
        : []

    // Build display list with match data
    let displayList = []
    if (mode === "matches") {
        displayList = matches.map((m) => ({ ...m.user, _matchData: m }))
    } else {
        displayList = users.map((u) => {
            const matchInfo = matches.find((m) => m.user.id === u.id)
            return { ...u, _matchData: matchInfo || null }
        })
    }

    if (sortBy === "match") {
        displayList.sort((a, b) => (b._matchData?.matchScore || 0) - (a._matchData?.matchScore || 0))
    } else if (sortBy === "name") {
        displayList.sort((a, b) => (a.name || "").localeCompare(b.name || ""))
    }

    const popularSkills = ["React", "Python", "Node.js", "JavaScript", "Docker", "Machine Learning", "Flutter", "TypeScript"]

    return (
        <div className="space-y-6">
            {/* Hero Search */}
            <div className="bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 rounded-2xl p-6 md:p-8">
                <h2 className="font-syne font-bold text-white text-xl md:text-2xl mb-1">
                    Discover Skill Partners
                </h2>
                <p className="text-neutral-400 font-sora text-sm mb-5">
                    Find people who know what you want to learn — and want to learn what you know.
                </p>

                <form onSubmit={handleSearch} className="relative">
                    <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10 px-5 py-3.5 focus-within:border-[#FF885B]/50 focus-within:bg-white/15 transition-all">
                        <FiSearch className="size-5 text-neutral-400 shrink-0" />
                        <input
                            type="text"
                            placeholder="Search by skill — React, Python, Machine Learning..."
                            className="flex-1 bg-transparent outline-none text-white font-sora text-sm placeholder:text-neutral-500"
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value)
                                setShowSuggestions(true)
                            }}
                            onFocus={() => setShowSuggestions(true)}
                            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                        />
                        <button
                            type="submit"
                            className="px-5 py-2 bg-[#FF885B] text-white rounded-lg text-xs font-sora font-semibold hover:bg-[#FF6B3D] transition-colors"
                        >
                            Search
                        </button>
                    </div>
                    {showSuggestions && filteredSuggestions.length > 0 && (
                        <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-xl shadow-xl border border-neutral-100 overflow-hidden z-20">
                            {filteredSuggestions.map((skill) => (
                                <button
                                    type="button"
                                    key={skill}
                                    className="w-full text-left px-5 py-3 text-sm font-sora text-neutral-600 hover:bg-[#FF885B]/5 hover:text-[#FF885B] transition-colors flex items-center gap-2"
                                    onMouseDown={() => {
                                        setSearchQuery(skill)
                                        setShowSuggestions(false)
                                        fetchUsers(skill)
                                    }}
                                >
                                    <FiSearch className="size-3 text-neutral-300" />
                                    {skill}
                                </button>
                            ))}
                        </div>
                    )}
                </form>

                <div className="flex flex-wrap gap-2 mt-4">
                    <span className="text-xs text-neutral-500 font-sora py-1">Trending:</span>
                    {popularSkills.map((skill) => (
                        <button
                            key={skill}
                            onClick={() => {
                                setSearchQuery(skill)
                                setLoading(true)
                                fetchUsers(skill).then(() => setLoading(false))
                            }}
                            className="px-3 py-1 rounded-full text-xs font-sora font-medium bg-white/5 text-neutral-300 border border-white/10 hover:border-[#FF885B]/40 hover:text-[#FF885B] transition-all"
                        >
                            {skill}
                        </button>
                    ))}
                </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => { setMode("all"); setLoading(true); fetchUsers(searchQuery).then(() => setLoading(false)) }}
                        className={`px-4 py-2 rounded-full text-xs font-sora font-medium transition-all ${mode === "all"
                            ? "bg-neutral-900 text-white shadow-sm"
                            : "bg-white text-neutral-600 border border-neutral-200 hover:border-neutral-400"
                            }`}
                    >
                        <FiUsers className="inline mr-1.5 size-3.5" />
                        All Users ({users.length})
                    </button>
                    {currentUser && (
                        <button
                            onClick={() => setMode("matches")}
                            className={`px-4 py-2 rounded-full text-xs font-sora font-medium transition-all ${mode === "matches"
                                ? "bg-[#FF885B] text-white shadow-sm"
                                : "bg-white text-neutral-600 border border-neutral-200 hover:border-[#FF885B]"
                                }`}
                        >
                            🤝 My Matches ({matches.length})
                        </button>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <FiFilter className="size-3.5 text-neutral-400" />
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="bg-white border border-neutral-200 rounded-lg px-3 py-1.5 text-xs font-sora text-neutral-600 outline-none focus:border-[#FF885B]"
                    >
                        <option value="default">Default</option>
                        <option value="match">Match % (High→Low)</option>
                        <option value="name">Name (A→Z)</option>
                    </select>
                </div>
            </div>

            {/* Alert */}
            {!currentUser && (
                <div className="flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl text-sm font-sora text-amber-800 border border-amber-100">
                    <FiAlertCircle className="size-5 shrink-0 text-amber-500" />
                    <p>Create your profile in the <strong>My Profile</strong> tab to unlock skill matching and send collab requests.</p>
                </div>
            )}

            {/* Results */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="size-10 border-2 border-neutral-200 border-t-[#FF885B] rounded-full animate-spin mb-3" />
                    <p className="text-sm text-neutral-400 font-sora">Discovering users...</p>
                </div>
            ) : displayList.length === 0 ? (
                <div className="text-center py-20 text-neutral-400 font-sora">
                    <FiUsers className="size-14 mx-auto mb-4 opacity-20" />
                    <p className="text-lg font-medium text-neutral-500">No users found</p>
                    <p className="text-sm mt-1">
                        {mode === "matches"
                            ? "No matches yet — more users need to register!"
                            : searchQuery
                                ? `No one with "${searchQuery}" skills yet. Be the first!`
                                : "Be the first to register your skills!"}
                    </p>
                </div>
            ) : (
                <>
                    <p className="text-xs font-sora text-neutral-400 px-1">
                        Showing {displayList.length} {mode === "matches" ? "matches" : "users"}
                        {searchQuery && <> for <span className="text-[#FF885B] font-medium">&quot;{searchQuery}&quot;</span></>}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {displayList.map((user, idx) => (
                            <UserCard
                                key={user.id || idx}
                                user={user}
                                matchData={user._matchData}
                                currentUserId={currentUser?.id}
                                onSendCollab={handleSendCollab}
                                githubData={user.githubUsername ? (githubDataMap[user.githubUsername] || githubCache[user.githubUsername] || null) : null}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}

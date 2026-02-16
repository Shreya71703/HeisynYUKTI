'use client'

import { useState, useEffect } from "react"
import { FiSearch, FiUsers, FiAlertCircle } from "react-icons/fi"
import UserCard from "../user-card"
import { skillSuggestions } from "../../data"

export default function DiscoverPanel({ currentUser }) {
    const [searchQuery, setSearchQuery] = useState("")
    const [users, setUsers] = useState([])
    const [matches, setMatches] = useState([])
    const [loading, setLoading] = useState(false)
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [mode, setMode] = useState("all") // "all" | "matches"

    // Fetch all users
    useEffect(() => {
        fetchUsers()
    }, [])

    // Fetch matches if user is registered
    useEffect(() => {
        if (currentUser?.id) {
            fetchMatches()
        }
    }, [currentUser])

    const fetchUsers = async (skill = "") => {
        setLoading(true)
        try {
            const url = skill
                ? `/api/guide-barter/users?skill=${encodeURIComponent(skill)}`
                : "/api/guide-barter/users"
            const res = await fetch(url)
            const data = await res.json()
            setUsers(data.users || [])
        } catch (e) {
            console.error("Failed to fetch users", e)
        }
        setLoading(false)
    }

    const fetchMatches = async () => {
        if (!currentUser?.id) return
        try {
            const res = await fetch(
                `/api/guide-barter/matches?userId=${currentUser.id}`
            )
            const data = await res.json()
            setMatches(data.matches || [])
        } catch (e) {
            console.error("Failed to fetch matches", e)
        }
    }

    const handleSearch = (e) => {
        e.preventDefault()
        fetchUsers(searchQuery)
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

    const displayUsers = mode === "matches" ? matches.map((m) => m.user) : users

    return (
        <div className="space-y-6">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="relative">
                <div className="flex items-center gap-3 bg-white rounded-full border border-neutral-200 px-5 py-3 shadow-sm focus-within:border-[#FF885B] focus-within:shadow-md transition-all">
                    <FiSearch className="size-5 text-neutral-400 shrink-0" />
                    <input
                        type="text"
                        placeholder="Search skills... (e.g., React, Python, Node.js)"
                        className="flex-1 bg-transparent outline-none text-neutral-700 font-sora text-sm placeholder:text-neutral-400"
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
                        className="px-4 py-1.5 bg-neutral-900 text-white rounded-full text-xs font-sora font-medium hover:bg-[#FF885B] transition-colors"
                    >
                        Search
                    </button>
                </div>
                {/* Suggestions Dropdown */}
                {showSuggestions && filteredSuggestions.length > 0 && (
                    <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-xl shadow-lg border border-neutral-100 overflow-hidden z-20">
                        {filteredSuggestions.map((skill) => (
                            <button
                                type="button"
                                key={skill}
                                className="w-full text-left px-5 py-2.5 text-sm font-sora text-neutral-600 hover:bg-neutral-50 hover:text-[#FF885B] transition-colors"
                                onMouseDown={() => {
                                    setSearchQuery(skill)
                                    setShowSuggestions(false)
                                    fetchUsers(skill)
                                }}
                            >
                                {skill}
                            </button>
                        ))}
                    </div>
                )}
            </form>

            {/* Toggle Mode */}
            {currentUser && (
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => { setMode("all"); fetchUsers(searchQuery) }}
                        className={`px-4 py-2 rounded-full text-xs font-sora font-medium transition-all ${mode === "all"
                                ? "bg-neutral-900 text-white"
                                : "bg-white text-neutral-600 border border-neutral-200 hover:border-neutral-400"
                            }`}
                    >
                        <FiUsers className="inline mr-1.5 size-3.5" />
                        All Users
                    </button>
                    <button
                        onClick={() => setMode("matches")}
                        className={`px-4 py-2 rounded-full text-xs font-sora font-medium transition-all ${mode === "matches"
                                ? "bg-[#FF885B] text-white"
                                : "bg-white text-neutral-600 border border-neutral-200 hover:border-[#FF885B]"
                            }`}
                    >
                        🤝 My Matches
                    </button>
                </div>
            )}

            {/* Results */}
            {!currentUser && (
                <div className="flex items-center gap-2 px-4 py-3 bg-amber-50 rounded-xl text-sm font-sora text-amber-700">
                    <FiAlertCircle className="size-4 shrink-0" />
                    <p>Create your profile in the <strong>My Profile</strong> tab to find matches and send collab requests.</p>
                </div>
            )}

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="size-8 border-2 border-neutral-300 border-t-[#FF885B] rounded-full animate-spin" />
                </div>
            ) : displayUsers.length === 0 ? (
                <div className="text-center py-20 text-neutral-400 font-sora">
                    <FiUsers className="size-12 mx-auto mb-3 opacity-30" />
                    <p className="text-lg font-medium">No users found</p>
                    <p className="text-sm mt-1">
                        {mode === "matches"
                            ? "No matches yet. More users need to register!"
                            : "Be the first to register your skills!"}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {displayUsers.map((user, idx) => {
                        const matchInfo = mode === "matches"
                            ? matches.find((m) => m.user.id === user.id)
                            : undefined
                        return (
                            <UserCard
                                key={user.id || idx}
                                user={user}
                                matchData={matchInfo}
                                currentUserId={currentUser?.id}
                                onSendCollab={handleSendCollab}
                            />
                        )
                    })}
                </div>
            )}
        </div>
    )
}

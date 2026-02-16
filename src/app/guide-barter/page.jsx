'use client'

import { useState, useEffect, useCallback } from "react"
import Container from "@/app/components/container"
import DotButton from "@/app/components/buttons/dot-button"
import DotButtonDark from "@/app/components/buttons/dot-button-dark"
import DiscoverPanel from "./components/discover"
import ProfilePanel from "./components/profile"
import MessagesPanel from "./components/messages"
import { motion, AnimatePresence } from "framer-motion"

const tabs = ["Discover", "My Profile", "Messages"]

export default function GuideBarterPage() {
    const [activeTab, setActiveTab] = useState("Discover")
    const [currentUser, setCurrentUser] = useState(null)
    const [synced, setSynced] = useState(false)
    const [messageCount, setMessageCount] = useState(0)

    // Load current user from localStorage AND sync to the server store
    useEffect(() => {
        const saved = localStorage.getItem("guideBarterUser")
        if (saved) {
            try {
                const user = JSON.parse(saved)
                setCurrentUser(user)
                syncUserToServer(user)
            } catch (e) {
                console.error("Failed to parse saved user", e)
                setSynced(true)
            }
        } else {
            setSynced(true)
        }
    }, [])

    // Fetch message count when user is available
    useEffect(() => {
        if (!currentUser?.id) return
        const fetchCount = async () => {
            try {
                const res = await fetch(`/api/guide-barter/chat?userId=${currentUser.id}`)
                const data = await res.json()
                setMessageCount((data.conversations || []).length)
            } catch (e) { /* ignore */ }
        }
        fetchCount()
        // Refresh count every 10 seconds
        const interval = setInterval(fetchCount, 10000)
        return () => clearInterval(interval)
    }, [currentUser])

    const syncUserToServer = async (user) => {
        try {
            const checkRes = await fetch("/api/guide-barter/users")
            const checkData = await checkRes.json()
            const existingUsers = checkData.users || []
            const alreadyExists = existingUsers.some(
                (u) => u.id === user.id || (u.name && user.name && u.name.toLowerCase() === u.name.toLowerCase())
            )

            if (!alreadyExists) {
                const res = await fetch("/api/guide-barter/users", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(user),
                })
                const data = await res.json()
                if (data.user) {
                    setCurrentUser(data.user)
                    localStorage.setItem("guideBarterUser", JSON.stringify(data.user))
                }
            }
        } catch (e) {
            console.error("Failed to sync user to server", e)
        }
        setSynced(true)
    }

    const handleUserRegistered = useCallback((user) => {
        setCurrentUser(user)
        localStorage.setItem("guideBarterUser", JSON.stringify(user))
    }, [])

    const renderTab = () => {
        switch (activeTab) {
            case "Discover":
                return <DiscoverPanel currentUser={currentUser} />
            case "My Profile":
                return (
                    <ProfilePanel
                        currentUser={currentUser}
                        onUserRegistered={handleUserRegistered}
                    />
                )
            case "Messages":
                return <MessagesPanel currentUser={currentUser} />
            default:
                return <DiscoverPanel currentUser={currentUser} />
        }
    }

    return (
        <section className="bg-white min-h-dvh py-20">
            <Container>
                <div className="flex flex-col gap-6">
                    {/* Hero Section */}
                    <div className="space-y-3">
                        <h1 className="text-center md:text-left font-syne font-medium text-2xl">
                            Guide Barter
                        </h1>
                        <h2 className="text-5xl md:text-6xl lg:text-[140px] tracking-wide text-center md:text-left text-neutral-900 font-bebas uppercase">
                            Exchange Skills. Grow Together.
                        </h2>
                        <p className="text-neutral-500 font-sora text-sm md:text-base max-w-2xl text-center md:text-left">
                            Find peers who know what you want to learn, and teach them what you know.
                            Peer-to-peer skill bartering for mutual growth.
                        </p>
                    </div>

                    {/* Tab Navigation */}
                    <div className="flex items-center justify-center md:justify-start gap-2 md:gap-4 flex-wrap">
                        {tabs.map((tab) => {
                            const isActive = activeTab === tab
                            const TabComponent = isActive ? DotButtonDark : DotButton

                            return (
                                <TabComponent key={tab} onClick={() => setActiveTab(tab)}>
                                    <span className="relative inline-flex items-center gap-1">
                                        {tab}
                                        {tab === "Messages" && messageCount > 0 && (
                                            <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-[#FF885B] text-white text-[10px] font-sora font-bold leading-none">
                                                {messageCount}
                                            </span>
                                        )}
                                    </span>
                                </TabComponent>
                            )
                        })}
                    </div>

                    {/* Active Tab Content */}
                    <div className="rounded-xl bg-neutral-100 min-h-[60vh] p-4 md:p-6">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                {renderTab()}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </Container>
        </section>
    )
}

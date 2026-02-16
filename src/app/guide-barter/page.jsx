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

    // Load current user from localStorage
    useEffect(() => {
        const saved = localStorage.getItem("guideBarterUser")
        if (saved) {
            try {
                setCurrentUser(JSON.parse(saved))
            } catch (e) {
                console.error("Failed to parse saved user", e)
            }
        }
    }, [])

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
                        {tabs.map((tab) =>
                            activeTab === tab ? (
                                <DotButtonDark key={tab} onClick={() => setActiveTab(tab)}>
                                    {tab}
                                </DotButtonDark>
                            ) : (
                                <DotButton key={tab} onClick={() => setActiveTab(tab)}>
                                    {tab}
                                </DotButton>
                            )
                        )}
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

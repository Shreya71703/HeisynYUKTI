'use client'

import { useState, useEffect, useRef } from "react"
import {
    FiSend, FiCheck, FiX, FiMessageCircle, FiAlertCircle,
    FiArrowLeft, FiUsers, FiZap
} from "react-icons/fi"

export default function MessagesPanel({ currentUser }) {
    const [conversations, setConversations] = useState([])
    const [activeChat, setActiveChat] = useState(null)
    const [messages, setMessages] = useState([])
    const [newMessage, setNewMessage] = useState("")
    const [loadingConvos, setLoadingConvos] = useState(false)
    const [loadingMessages, setLoadingMessages] = useState(false)
    const [allUsers, setAllUsers] = useState([])
    const chatEndRef = useRef(null)

    useEffect(() => {
        if (currentUser?.id) {
            fetchConversations()
            fetchAllUsers()
        }
    }, [currentUser])

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    const fetchAllUsers = async () => {
        try {
            const res = await fetch("/api/guide-barter/users")
            const data = await res.json()
            setAllUsers(data.users || [])
        } catch (e) {
            console.error(e)
        }
    }

    const getUserName = (userId) => {
        const user = allUsers.find((u) => u.id === userId)
        return user?.name || "User"
    }

    const fetchConversations = async () => {
        if (!currentUser?.id) return
        setLoadingConvos(true)
        try {
            const res = await fetch(`/api/guide-barter/chat?userId=${currentUser.id}`)
            const data = await res.json()
            setConversations(data.conversations || [])
        } catch (e) {
            console.error("Failed to fetch conversations", e)
        }
        setLoadingConvos(false)
    }

    const openChat = async (otherId, otherName) => {
        const resolvedName = otherName === "Unknown" ? getUserName(otherId) : otherName
        setActiveChat({ id: otherId, name: resolvedName || "User" })
        setLoadingMessages(true)
        try {
            const res = await fetch(
                `/api/guide-barter/chat?userId=${currentUser.id}&otherId=${otherId}`
            )
            const data = await res.json()
            setMessages(data.messages || [])
        } catch (e) {
            console.error("Failed to fetch messages", e)
        }
        setLoadingMessages(false)
    }

    const sendMessage = async (e) => {
        e.preventDefault()
        if (!newMessage.trim() || !activeChat) return
        // Optimistic update
        const tempMsg = {
            id: `temp-${Date.now()}`,
            fromId: currentUser.id,
            toId: activeChat.id,
            content: newMessage.trim(),
            type: "text",
            timestamp: new Date().toISOString(),
        }
        setMessages((prev) => [...prev, tempMsg])
        setNewMessage("")
        try {
            const res = await fetch("/api/guide-barter/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    fromId: currentUser.id,
                    toId: activeChat.id,
                    content: tempMsg.content,
                    type: "text",
                }),
            })
            const data = await res.json()
            // Replace temp with real
            setMessages((prev) =>
                prev.map((m) => (m.id === tempMsg.id ? data.message : m))
            )
        } catch (e) {
            console.error("Failed to send message", e)
        }
    }

    const respondToCollab = async (msgId, accept) => {
        try {
            await fetch("/api/guide-barter/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    fromId: currentUser.id,
                    toId: activeChat.id,
                    content: accept
                        ? "I'd love to collaborate! Let's connect and start learning together. 🎉"
                        : "Thanks for reaching out, but I'll have to pass for now.",
                    type: accept ? "collab_accept" : "collab_decline",
                }),
            })
            openChat(activeChat.id, activeChat.name)
        } catch (e) {
            console.error("Failed to respond", e)
        }
    }

    const formatTime = (ts) => {
        const d = new Date(ts)
        const now = new Date()
        const diff = now - d
        if (diff < 60000) return "Just now"
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
        if (diff < 86400000) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        return d.toLocaleDateString([], { month: "short", day: "numeric" })
    }

    if (!currentUser) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-neutral-400 font-sora">
                <div className="size-20 rounded-full bg-gradient-to-br from-[#FF885B]/20 to-[#FF6B3D]/10 flex items-center justify-center mb-4">
                    <FiAlertCircle className="size-10 text-[#FF885B]/50" />
                </div>
                <p className="text-lg font-syne font-semibold text-neutral-600">Create your profile first</p>
                <p className="text-sm mt-1">Go to the <span className="text-[#FF885B] font-medium">My Profile</span> tab to get started.</p>
            </div>
        )
    }

    // Resolve conversation names
    const resolvedConversations = conversations.map((c) => ({
        ...c,
        userName: c.userName === "Unknown" ? getUserName(c.userId) : c.userName,
    }))

    return (
        <div className="flex flex-col md:flex-row gap-0 md:gap-0 min-h-[520px] bg-white rounded-2xl overflow-hidden border border-neutral-200 shadow-sm">
            {/* Conversation List */}
            <div className={`w-full md:w-80 shrink-0 border-r border-neutral-100 flex flex-col ${activeChat ? "hidden md:flex" : "flex"}`}>
                {/* Header */}
                <div className="p-5 border-b border-neutral-100 bg-gradient-to-r from-neutral-900 to-neutral-800">
                    <div className="flex items-center justify-between">
                        <h3 className="font-syne font-bold text-white text-lg flex items-center gap-2">
                            <FiMessageCircle className="size-5 text-[#FF885B]" />
                            Messages
                        </h3>
                        {resolvedConversations.length > 0 && (
                            <span className="px-2.5 py-0.5 rounded-full bg-[#FF885B] text-white text-xs font-sora font-bold">
                                {resolvedConversations.length}
                            </span>
                        )}
                    </div>
                </div>

                {/* Conversation items */}
                <div className="flex-1 overflow-y-auto">
                    {loadingConvos ? (
                        <div className="flex items-center justify-center py-10">
                            <div className="size-7 border-2 border-neutral-200 border-t-[#FF885B] rounded-full animate-spin" />
                        </div>
                    ) : resolvedConversations.length === 0 ? (
                        <div className="text-center py-14 px-6 text-neutral-400 font-sora">
                            <div className="size-16 rounded-full bg-neutral-50 flex items-center justify-center mx-auto mb-3">
                                <FiUsers className="size-7 text-neutral-300" />
                            </div>
                            <p className="text-sm font-medium text-neutral-500">No conversations yet</p>
                            <p className="text-xs mt-2 text-neutral-400 leading-relaxed">
                                Go to <span className="text-[#FF885B] font-medium">Discover</span> and send a collab request to start chatting!
                            </p>
                        </div>
                    ) : (
                        resolvedConversations.map((convo) => (
                            <button
                                key={convo.userId}
                                onClick={() => openChat(convo.userId, convo.userName)}
                                className={`w-full text-left px-4 py-3.5 border-b border-neutral-50 hover:bg-[#FF885B]/5 transition-all group ${activeChat?.id === convo.userId ? "bg-[#FF885B]/10 border-l-3 border-l-[#FF885B]" : ""
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`size-11 rounded-full flex items-center justify-center text-white font-bebas text-lg shrink-0 ${activeChat?.id === convo.userId
                                            ? "bg-[#FF885B]"
                                            : "bg-gradient-to-br from-neutral-700 to-neutral-900"
                                        }`}>
                                        {convo.userName?.charAt(0)?.toUpperCase() || "?"}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center justify-between">
                                            <p className="font-sora font-semibold text-neutral-800 text-sm truncate">
                                                {convo.userName}
                                            </p>
                                            <span className="text-[10px] text-neutral-400 font-sora shrink-0 ml-2">
                                                {formatTime(convo.lastMessageTime)}
                                            </span>
                                        </div>
                                        <p className="text-xs text-neutral-400 font-sora truncate mt-0.5 flex items-center gap-1">
                                            {convo.lastMessageType === "collab_request" && <span className="text-amber-500">🤝</span>}
                                            {convo.lastMessageType === "collab_accept" && <span className="text-emerald-500">✅</span>}
                                            {convo.lastMessage?.slice(0, 50)}
                                        </p>
                                    </div>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Window */}
            <div className={`flex-1 flex flex-col ${!activeChat ? "hidden md:flex" : "flex"}`}>
                {!activeChat ? (
                    <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-b from-neutral-50 to-white">
                        <div className="size-24 rounded-full bg-gradient-to-br from-[#FF885B]/10 to-[#FF6B3D]/5 flex items-center justify-center mb-4">
                            <FiZap className="size-10 text-[#FF885B]/40" />
                        </div>
                        <p className="font-syne font-semibold text-neutral-500 text-lg">Start a conversation</p>
                        <p className="text-sm text-neutral-400 font-sora mt-1">Select a conversation or send a collab request</p>
                    </div>
                ) : (
                    <>
                        {/* Chat Header */}
                        <div className="px-5 py-4 border-b border-neutral-100 bg-gradient-to-r from-neutral-50 to-white flex items-center gap-3">
                            {/* Mobile back button */}
                            <button
                                onClick={() => setActiveChat(null)}
                                className="md:hidden p-1.5 rounded-lg hover:bg-neutral-100 transition-colors"
                            >
                                <FiArrowLeft className="size-5 text-neutral-600" />
                            </button>
                            <div className="size-10 rounded-full bg-gradient-to-br from-[#FF885B] to-[#FF6B3D] flex items-center justify-center text-white font-bebas text-lg shrink-0">
                                {activeChat.name?.charAt(0)?.toUpperCase() || "?"}
                            </div>
                            <div>
                                <h4 className="font-syne font-bold text-neutral-900">{activeChat.name}</h4>
                                <p className="text-[11px] text-neutral-400 font-sora">Guide Barter Partner</p>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 bg-gradient-to-b from-neutral-50/50 to-white" style={{ maxHeight: "400px" }}>
                            {loadingMessages ? (
                                <div className="flex items-center justify-center py-10">
                                    <div className="size-7 border-2 border-neutral-200 border-t-[#FF885B] rounded-full animate-spin" />
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="text-center py-14 text-neutral-400 font-sora">
                                    <p className="text-lg">👋</p>
                                    <p className="text-sm mt-1">Say hi to start the conversation!</p>
                                </div>
                            ) : (
                                messages.map((msg) => {
                                    const isMine = msg.fromId === currentUser.id
                                    const isCollab = msg.type === "collab_request"
                                    const isAccept = msg.type === "collab_accept"
                                    const isDecline = msg.type === "collab_decline"

                                    return (
                                        <div
                                            key={msg.id}
                                            className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                                        >
                                            <div
                                                className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${isCollab
                                                        ? "bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/60"
                                                        : isAccept
                                                            ? "bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200/60"
                                                            : isDecline
                                                                ? "bg-gradient-to-br from-red-50 to-pink-50 border border-red-200/60"
                                                                : isMine
                                                                    ? "bg-gradient-to-br from-neutral-900 to-neutral-800 text-white"
                                                                    : "bg-white border border-neutral-100 text-neutral-800"
                                                    }`}
                                            >
                                                {isCollab && (
                                                    <p className="text-xs font-sora font-bold text-amber-600 mb-1.5 flex items-center gap-1">
                                                        🤝 Collaboration Request
                                                    </p>
                                                )}
                                                {isAccept && (
                                                    <p className="text-xs font-sora font-bold text-emerald-600 mb-1.5 flex items-center gap-1">
                                                        ✅ Collaboration Accepted!
                                                    </p>
                                                )}
                                                {isDecline && (
                                                    <p className="text-xs font-sora font-bold text-red-500 mb-1.5">
                                                        ❌ Declined
                                                    </p>
                                                )}
                                                <p className="text-sm font-sora leading-relaxed">
                                                    {msg.content}
                                                </p>
                                                <p className={`text-[10px] mt-1.5 font-sora ${isMine && !isCollab && !isAccept && !isDecline
                                                        ? "text-neutral-500"
                                                        : "text-neutral-400"
                                                    }`}>
                                                    {formatTime(msg.timestamp)}
                                                </p>
                                                {isCollab && !isMine && (
                                                    <div className="flex items-center gap-2 mt-3 pt-2 border-t border-amber-100">
                                                        <button
                                                            onClick={() => respondToCollab(msg.id, true)}
                                                            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 text-white rounded-full text-xs font-sora font-semibold hover:bg-emerald-600 transition-colors shadow-sm"
                                                        >
                                                            <FiCheck className="size-3.5" /> Accept
                                                        </button>
                                                        <button
                                                            onClick={() => respondToCollab(msg.id, false)}
                                                            className="flex items-center gap-1.5 px-4 py-2 bg-neutral-200 text-neutral-600 rounded-full text-xs font-sora font-semibold hover:bg-neutral-300 transition-colors"
                                                        >
                                                            <FiX className="size-3.5" /> Decline
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        {/* Message Input */}
                        <form onSubmit={sendMessage} className="px-5 py-4 border-t border-neutral-100 bg-white">
                            <div className="flex items-center gap-3">
                                <input
                                    type="text"
                                    className="flex-1 px-5 py-3 rounded-full bg-neutral-50 border border-neutral-200 font-sora text-sm outline-none focus:border-[#FF885B] focus:bg-white transition-all"
                                    placeholder="Type a message..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                />
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim()}
                                    className="p-3 rounded-full bg-gradient-to-br from-[#FF885B] to-[#FF6B3D] text-white hover:shadow-lg hover:scale-105 transition-all disabled:opacity-30 disabled:hover:shadow-none disabled:hover:scale-100"
                                >
                                    <FiSend className="size-4" />
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    )
}

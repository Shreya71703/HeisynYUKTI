'use client'

import { useState, useEffect, useRef } from "react"
import { FiSend, FiCheck, FiX, FiMessageCircle, FiAlertCircle } from "react-icons/fi"

export default function MessagesPanel({ currentUser }) {
    const [conversations, setConversations] = useState([])
    const [activeChat, setActiveChat] = useState(null)
    const [messages, setMessages] = useState([])
    const [newMessage, setNewMessage] = useState("")
    const [loadingConvos, setLoadingConvos] = useState(false)
    const [loadingMessages, setLoadingMessages] = useState(false)
    const chatEndRef = useRef(null)

    useEffect(() => {
        if (currentUser?.id) fetchConversations()
    }, [currentUser])

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

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
        setActiveChat({ id: otherId, name: otherName })
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
        try {
            const res = await fetch("/api/guide-barter/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    fromId: currentUser.id,
                    toId: activeChat.id,
                    content: newMessage.trim(),
                    type: "text",
                }),
            })
            const data = await res.json()
            setMessages((prev) => [...prev, data.message])
            setNewMessage("")
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
            // Refresh messages
            openChat(activeChat.id, activeChat.name)
        } catch (e) {
            console.error("Failed to respond", e)
        }
    }

    if (!currentUser) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-neutral-400 font-sora">
                <FiAlertCircle className="size-12 mb-3 opacity-30" />
                <p className="text-lg font-medium">Create your profile first</p>
                <p className="text-sm mt-1">Go to the My Profile tab to set up your account.</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col md:flex-row gap-4 min-h-[500px]">
            {/* Conversation List */}
            <div className="w-full md:w-80 shrink-0 bg-white rounded-xl border border-neutral-200 overflow-hidden">
                <div className="p-4 border-b border-neutral-100">
                    <h3 className="font-syne font-semibold text-neutral-900">
                        Conversations
                    </h3>
                </div>
                <div className="max-h-[440px] overflow-y-auto">
                    {loadingConvos ? (
                        <div className="flex items-center justify-center py-10">
                            <div className="size-6 border-2 border-neutral-300 border-t-[#FF885B] rounded-full animate-spin" />
                        </div>
                    ) : conversations.length === 0 ? (
                        <div className="text-center py-10 px-4 text-neutral-400 font-sora text-sm">
                            <FiMessageCircle className="size-8 mx-auto mb-2 opacity-30" />
                            <p>No conversations yet.</p>
                            <p className="text-xs mt-1">Send collab requests from the Discover tab!</p>
                        </div>
                    ) : (
                        conversations.map((convo) => (
                            <button
                                key={convo.userId}
                                onClick={() => openChat(convo.userId, convo.userName)}
                                className={`w-full text-left p-4 border-b border-neutral-50 hover:bg-neutral-50 transition-colors ${activeChat?.id === convo.userId ? "bg-neutral-50 border-l-2 border-l-[#FF885B]" : ""
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="size-10 rounded-full bg-gradient-to-br from-[#FF885B] to-[#FF6B3D] flex items-center justify-center text-white font-bebas text-lg shrink-0">
                                        {convo.userName?.charAt(0)?.toUpperCase() || "?"}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-syne font-medium text-neutral-900 text-sm truncate">
                                            {convo.userName}
                                        </p>
                                        <p className="text-xs text-neutral-400 font-sora truncate mt-0.5">
                                            {convo.lastMessageType === "collab_request" && "🤝 "}
                                            {convo.lastMessageType === "collab_accept" && "✅ "}
                                            {convo.lastMessage}
                                        </p>
                                    </div>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Window */}
            <div className="flex-1 bg-white rounded-xl border border-neutral-200 flex flex-col overflow-hidden">
                {!activeChat ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-neutral-400 font-sora">
                        <FiMessageCircle className="size-12 mb-3 opacity-20" />
                        <p className="text-sm">Select a conversation to start chatting</p>
                    </div>
                ) : (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 border-b border-neutral-100 flex items-center gap-3">
                            <div className="size-9 rounded-full bg-gradient-to-br from-[#FF885B] to-[#FF6B3D] flex items-center justify-center text-white font-bebas shrink-0">
                                {activeChat.name?.charAt(0)?.toUpperCase() || "?"}
                            </div>
                            <h4 className="font-syne font-semibold text-neutral-900">
                                {activeChat.name}
                            </h4>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[380px]">
                            {loadingMessages ? (
                                <div className="flex items-center justify-center py-10">
                                    <div className="size-6 border-2 border-neutral-300 border-t-[#FF885B] rounded-full animate-spin" />
                                </div>
                            ) : messages.length === 0 ? (
                                <p className="text-center text-neutral-400 font-sora text-sm py-10">
                                    No messages yet. Say hi! 👋
                                </p>
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
                                                className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${isCollab
                                                        ? "bg-amber-50 border border-amber-200"
                                                        : isAccept
                                                            ? "bg-emerald-50 border border-emerald-200"
                                                            : isDecline
                                                                ? "bg-red-50 border border-red-200"
                                                                : isMine
                                                                    ? "bg-neutral-900 text-white"
                                                                    : "bg-neutral-100 text-neutral-800"
                                                    }`}
                                            >
                                                {isCollab && (
                                                    <p className="text-xs font-sora font-semibold text-amber-600 mb-1">
                                                        🤝 Collab Request
                                                    </p>
                                                )}
                                                {isAccept && (
                                                    <p className="text-xs font-sora font-semibold text-emerald-600 mb-1">
                                                        ✅ Collab Accepted
                                                    </p>
                                                )}
                                                {isDecline && (
                                                    <p className="text-xs font-sora font-semibold text-red-600 mb-1">
                                                        ❌ Declined
                                                    </p>
                                                )}
                                                <p className="text-sm font-sora leading-relaxed">
                                                    {msg.content}
                                                </p>
                                                <p className={`text-[10px] mt-1 ${isMine && !isCollab && !isAccept && !isDecline ? "text-neutral-400" : "text-neutral-400"
                                                    }`}>
                                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                                </p>
                                                {/* Collab response buttons */}
                                                {isCollab && !isMine && (
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <button
                                                            onClick={() => respondToCollab(msg.id, true)}
                                                            className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500 text-white rounded-full text-xs font-sora font-medium hover:bg-emerald-600 transition-colors"
                                                        >
                                                            <FiCheck className="size-3" /> Accept
                                                        </button>
                                                        <button
                                                            onClick={() => respondToCollab(msg.id, false)}
                                                            className="flex items-center gap-1 px-3 py-1.5 bg-neutral-200 text-neutral-600 rounded-full text-xs font-sora font-medium hover:bg-neutral-300 transition-colors"
                                                        >
                                                            <FiX className="size-3" /> Decline
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
                        <form onSubmit={sendMessage} className="p-4 border-t border-neutral-100">
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    className="flex-1 px-4 py-2.5 rounded-full bg-neutral-50 border border-neutral-200 font-sora text-sm outline-none focus:border-[#FF885B] transition-colors"
                                    placeholder="Type a message..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                />
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim()}
                                    className="p-2.5 rounded-full bg-neutral-900 text-white hover:bg-[#FF885B] transition-colors disabled:opacity-30 disabled:hover:bg-neutral-900"
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

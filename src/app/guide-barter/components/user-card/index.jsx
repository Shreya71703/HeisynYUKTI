'use client'

import { FiGithub, FiStar, FiGitBranch } from "react-icons/fi"

export default function UserCard({ user, matchData, onSendCollab, currentUserId }) {
    const isOwnCard = user.id === currentUserId

    return (
        <div className="bg-white rounded-xl p-5 shadow-sm border border-neutral-200 hover:shadow-md transition-shadow duration-300 flex flex-col gap-4">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className="size-12 rounded-full bg-gradient-to-br from-[#FF885B] to-[#FF6B3D] flex items-center justify-center text-white font-bebas text-xl">
                        {user.name?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    <div>
                        <h3 className="font-syne font-semibold text-neutral-900 text-lg">
                            {user.name}
                        </h3>
                        {user.githubUsername && (
                            <a
                                href={`https://github.com/${user.githubUsername}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-xs text-neutral-400 hover:text-accent transition-colors"
                            >
                                <FiGithub className="size-3" />
                                {user.githubUsername}
                            </a>
                        )}
                    </div>
                </div>
                {matchData && (
                    <div className="px-3 py-1 rounded-full bg-[#FF885B]/10 text-[#FF885B] text-xs font-sora font-semibold">
                        {matchData.matchScore}% match
                    </div>
                )}
            </div>

            {/* Skills Known */}
            <div>
                <p className="text-xs text-neutral-400 font-sora uppercase tracking-wider mb-2">
                    Knows
                </p>
                <div className="flex flex-wrap gap-1.5">
                    {user.skillsKnown?.map((skill) => (
                        <span
                            key={skill}
                            className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-sora font-medium"
                        >
                            {skill}
                        </span>
                    ))}
                </div>
            </div>

            {/* Skills Wanted */}
            <div>
                <p className="text-xs text-neutral-400 font-sora uppercase tracking-wider mb-2">
                    Wants to Learn
                </p>
                <div className="flex flex-wrap gap-1.5">
                    {user.skillsWanted?.map((skill) => (
                        <span
                            key={skill}
                            className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-sora font-medium"
                        >
                            {skill}
                        </span>
                    ))}
                </div>
            </div>

            {/* Match Details */}
            {matchData && (matchData.theyTeachMe?.length > 0 || matchData.iTeachThem?.length > 0) && (
                <div className="border-t border-neutral-100 pt-3 space-y-2">
                    {matchData.theyTeachMe?.length > 0 && (
                        <p className="text-xs text-neutral-500 font-sora">
                            <span className="text-emerald-600 font-medium">They can teach you:</span>{" "}
                            {matchData.theyTeachMe.join(", ")}
                        </p>
                    )}
                    {matchData.iTeachThem?.length > 0 && (
                        <p className="text-xs text-neutral-500 font-sora">
                            <span className="text-blue-600 font-medium">You can teach them:</span>{" "}
                            {matchData.iTeachThem.join(", ")}
                        </p>
                    )}
                </div>
            )}

            {/* Action Button */}
            {!isOwnCard && onSendCollab && (
                <button
                    onClick={() => onSendCollab(user)}
                    className="w-full mt-auto py-2.5 rounded-full bg-neutral-900 text-white font-sora text-sm font-medium hover:bg-[#FF885B] transition-colors duration-300"
                >
                    Send Collab Request
                </button>
            )}
        </div>
    )
}

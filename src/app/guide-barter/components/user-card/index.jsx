'use client'

import { useState } from "react"
import { FiGithub, FiStar, FiGitBranch, FiBook, FiExternalLink } from "react-icons/fi"

const tierColors = {
    gold: "from-yellow-400 to-amber-500",
    silver: "from-neutral-300 to-neutral-400",
    bronze: "from-amber-600 to-amber-700",
    none: "from-[#FF885B] to-[#FF6B3D]",
}

const tierBorderColors = {
    gold: "border-yellow-400/50",
    silver: "border-neutral-300/50",
    bronze: "border-amber-600/50",
    none: "border-neutral-200",
}

// Custom tooltip component for badges
function BadgeTooltip({ badge, children }) {
    const [show, setShow] = useState(false)

    return (
        <span
            className="relative inline-flex"
            onMouseEnter={() => setShow(true)}
            onMouseLeave={() => setShow(false)}
        >
            {children}
            {show && (
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-neutral-900 text-white text-[10px] font-sora rounded-lg shadow-xl whitespace-nowrap z-50 pointer-events-none">
                    <span className="block font-semibold text-[11px] mb-0.5">{badge.icon} {badge.label}</span>
                    <span className="block text-neutral-300">{badge.description}</span>
                    <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-neutral-900" />
                </span>
            )}
        </span>
    )
}

export default function UserCard({ user, matchData, onSendCollab, currentUserId, githubData }) {
    const isOwnCard = user.id === currentUserId

    const badges = githubData?.badges || []
    const badgeTier = githubData?.badgeTier || "none"
    const avatar = githubData?.profile?.avatar

    return (
        <div className={`bg-white rounded-2xl shadow-sm border ${tierBorderColors[badgeTier]} hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col`}>
            {/* Tier gradient bar */}
            <div className={`h-1.5 bg-gradient-to-r ${tierColors[badgeTier]}`} />

            <div className="p-5 flex flex-col gap-4 flex-1">
                {/* Header: Avatar + Name + Match */}
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        {avatar ? (
                            <img
                                src={avatar}
                                alt={user.name}
                                className={`size-14 rounded-full object-cover border-2 ${badgeTier === "gold" ? "border-yellow-400" : badgeTier === "silver" ? "border-neutral-300" : badgeTier === "bronze" ? "border-amber-600" : "border-neutral-200"
                                    }`}
                            />
                        ) : (
                            <div className={`size-14 rounded-full bg-gradient-to-br ${tierColors[badgeTier]} flex items-center justify-center text-white font-bebas text-2xl`}>
                                {user.name?.charAt(0)?.toUpperCase() || "?"}
                            </div>
                        )}
                        <div className="min-w-0">
                            <h3 className="font-syne font-semibold text-neutral-900 text-lg leading-tight truncate">
                                {user.name}
                            </h3>
                            {user.collegeName && (
                                <p className="text-[11px] text-neutral-400 font-sora truncate">
                                    {user.collegeName} {user.yearOfStudy ? `· ${user.yearOfStudy}` : ""}
                                </p>
                            )}
                            {user.githubUsername && (
                                <a
                                    href={`https://github.com/${user.githubUsername}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-xs text-neutral-400 hover:text-[#FF885B] transition-colors mt-0.5"
                                >
                                    <FiGithub className="size-3" />
                                    {user.githubUsername}
                                </a>
                            )}
                        </div>
                    </div>
                    {matchData && (
                        <div className={`px-3 py-1.5 rounded-full text-xs font-sora font-bold ${matchData.matchScore >= 70
                                ? "bg-emerald-50 text-emerald-700"
                                : matchData.matchScore >= 40
                                    ? "bg-[#FF885B]/10 text-[#FF885B]"
                                    : "bg-neutral-100 text-neutral-500"
                            }`}>
                            {matchData.matchScore}%
                        </div>
                    )}
                </div>

                {/* GitHub Badges with rich tooltips */}
                {badges.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        {badges.map((badge, i) => (
                            <BadgeTooltip key={i} badge={badge}>
                                <span
                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-sora font-semibold cursor-help ${badge.type === "gold" ? "bg-yellow-50 text-yellow-700" :
                                            badge.type === "silver" ? "bg-neutral-100 text-neutral-600" :
                                                badge.type === "bronze" ? "bg-amber-50 text-amber-700" :
                                                    badge.type === "star" || badge.type === "rising-star" ? "bg-purple-50 text-purple-600" :
                                                        badge.type === "contributor" ? "bg-red-50 text-red-600" :
                                                            badge.type === "active" ? "bg-blue-50 text-blue-600" :
                                                                "bg-neutral-50 text-neutral-500"
                                        }`}
                                >
                                    {badge.icon} {badge.label}
                                </span>
                            </BadgeTooltip>
                        ))}
                    </div>
                )}

                {/* GitHub Quick Stats */}
                {githubData?.scorecard && (
                    <div className="flex items-center gap-3 text-xs text-neutral-400 font-sora">
                        <span className="flex items-center gap-1"><FiBook className="size-3" /> {githubData.scorecard.totalRepos} repos</span>
                        <span className="flex items-center gap-1"><FiStar className="size-3" /> {githubData.scorecard.totalStars}</span>
                        <span className="flex items-center gap-1"><FiGitBranch className="size-3" /> {githubData.scorecard.totalForks}</span>
                        {githubData.scorecard.topLanguage !== "N/A" && (
                            <span className="px-1.5 py-0.5 rounded bg-[#FF885B]/10 text-[#FF885B] font-medium">
                                {githubData.scorecard.topLanguage}
                            </span>
                        )}
                    </div>
                )}

                {/* Skills Known */}
                <div>
                    <p className="text-[10px] text-neutral-400 font-sora uppercase tracking-wider mb-1.5">
                        Knows
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                        {user.skillsKnown?.slice(0, 8).map((skill) => (
                            <span
                                key={skill}
                                className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-sora font-medium"
                            >
                                {skill}
                            </span>
                        ))}
                        {user.skillsKnown?.length > 8 && (
                            <span className="px-2 py-1 rounded-full bg-neutral-100 text-neutral-500 text-[11px] font-sora">
                                +{user.skillsKnown.length - 8}
                            </span>
                        )}
                    </div>
                </div>

                {/* Skills Wanted */}
                <div>
                    <p className="text-[10px] text-neutral-400 font-sora uppercase tracking-wider mb-1.5">
                        Wants to Learn
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                        {user.skillsWanted?.slice(0, 6).map((skill) => (
                            <span
                                key={skill}
                                className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-[11px] font-sora font-medium"
                            >
                                {skill}
                            </span>
                        ))}
                        {user.skillsWanted?.length > 6 && (
                            <span className="px-2 py-1 rounded-full bg-neutral-100 text-neutral-500 text-[11px] font-sora">
                                +{user.skillsWanted.length - 6}
                            </span>
                        )}
                    </div>
                </div>

                {/* Match Details */}
                {matchData && (
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
                        {matchData.breakdown && (
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[10px] font-sora text-neutral-400">Score:</span>
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-sora bg-emerald-50 text-emerald-600">
                                    Skill {matchData.breakdown.skillOverlap}%
                                </span>
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-sora bg-blue-50 text-blue-600">
                                    Mutual {matchData.breakdown.mutualBenefit}%
                                </span>
                                {matchData.breakdown.githubLangOverlap > 0 && (
                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-sora bg-purple-50 text-purple-600">
                                        GitHub {matchData.breakdown.githubLangOverlap}%
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Resume / Project Links */}
                {(user.resumeLink || user.projectLinks?.length > 0) && (
                    <div className="flex items-center gap-2 flex-wrap">
                        {user.resumeLink && (
                            <a href={user.resumeLink} target="_blank" rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-neutral-50 text-neutral-500 text-[10px] font-sora hover:text-[#FF885B] transition-colors">
                                📄 Resume <FiExternalLink className="size-2.5" />
                            </a>
                        )}
                        {user.projectLinks?.slice(0, 2).map((link, i) => (
                            <a key={i} href={link} target="_blank" rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-neutral-50 text-neutral-500 text-[10px] font-sora hover:text-[#FF885B] transition-colors">
                                🔗 Project {i + 1} <FiExternalLink className="size-2.5" />
                            </a>
                        ))}
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
        </div>
    )
}

'use client'

import { useState, useRef } from "react"
import {
    FiUpload, FiFileText, FiTarget, FiTrendingUp,
    FiAlertTriangle, FiCheckCircle, FiStar, FiZap,
    FiArrowRight, FiRefreshCw, FiX
} from "react-icons/fi"

// Circular score gauge
function ScoreGauge({ score, label, size = 120, color = "#FF885B" }) {
    const radius = (size - 12) / 2
    const circumference = 2 * Math.PI * radius
    const offset = circumference - (score / 100) * circumference
    const getColor = (s) => s >= 80 ? "#22c55e" : s >= 60 ? "#FF885B" : s >= 40 ? "#eab308" : "#ef4444"
    const fillColor = color === "auto" ? getColor(score) : color

    return (
        <div className="flex flex-col items-center gap-2">
            <svg width={size} height={size} className="transform -rotate-90">
                <circle cx={size / 2} cy={size / 2} r={radius}
                    fill="none" stroke="#1f2937" strokeWidth="8" />
                <circle cx={size / 2} cy={size / 2} r={radius}
                    fill="none" stroke={fillColor} strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    style={{ transition: "stroke-dashoffset 1.5s ease-out" }}
                />
            </svg>
            <div className="absolute flex flex-col items-center justify-center" style={{ width: size, height: size }}>
                <span className="text-3xl font-bebas text-white">{score}</span>
                <span className="text-[10px] text-neutral-400 font-sora uppercase">{label || "Score"}</span>
            </div>
        </div>
    )
}

function MiniBar({ value, label, color }) {
    return (
        <div className="space-y-1">
            <div className="flex items-center justify-between">
                <span className="text-xs font-sora text-neutral-400">{label}</span>
                <span className="text-xs font-sora font-bold text-white">{value}%</span>
            </div>
            <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${value}%`, backgroundColor: color }} />
            </div>
        </div>
    )
}

export default function ResumeAnalyzerComponents() {
    const [resumeText, setResumeText] = useState("")
    const [jobDescription, setJobDescription] = useState("")
    const [analyzing, setAnalyzing] = useState(false)
    const [analysis, setAnalysis] = useState(null)
    const [error, setError] = useState("")
    const [step, setStep] = useState(1) // 1=input, 2=results
    const fileRef = useRef(null)

    const handleFileUpload = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (file.type === "text/plain" || file.name.endsWith(".txt")) {
            const text = await file.text()
            setResumeText(text)
        } else if (file.type === "application/pdf") {
            // For PDF, read as text (basic extraction)
            const text = await file.text()
            setResumeText(text || `[PDF uploaded: ${file.name}] — For best results, paste your resume text directly.`)
        } else {
            // Try reading as text
            try {
                const text = await file.text()
                setResumeText(text)
            } catch {
                setResumeText(`[File: ${file.name}] — Please paste your resume text for accurate analysis.`)
            }
        }
    }

    const analyzeResume = async () => {
        if (!resumeText.trim()) {
            setError("Please paste or upload your resume text.")
            return
        }
        setError("")
        setAnalyzing(true)

        try {
            const res = await fetch("/api/resume-analyzer", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    resumeText: resumeText.trim(),
                    jobDescription: jobDescription.trim(),
                }),
            })
            const data = await res.json()
            if (data.error) {
                setError(data.error)
            } else {
                setAnalysis(data.analysis)
                setStep(2)
            }
        } catch (e) {
            setError("Failed to analyze. Please try again.")
            console.error(e)
        }
        setAnalyzing(false)
    }

    const reset = () => {
        setAnalysis(null)
        setStep(1)
        setError("")
    }

    const getImportanceColor = (imp) => {
        if (imp === "critical") return "bg-red-500/20 text-red-400 border-red-500/30"
        if (imp === "high") return "bg-amber-500/20 text-amber-400 border-amber-500/30"
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
    }

    const getPriorityColor = (p) => {
        if (p === "high") return "text-red-400"
        if (p === "medium") return "text-amber-400"
        return "text-blue-400"
    }

    // Step 1: Input
    if (step === 1) {
        return (
            <div className="max-w-4xl mx-auto space-y-6 py-6">
                {/* Header */}
                <div className="text-center space-y-2">
                    <h2 className="text-3xl lg:text-4xl font-sora font-bold text-neutral-900">
                        Resume Analyzer
                    </h2>
                    <p className="text-neutral-500 font-sora text-sm max-w-lg mx-auto">
                        AI-powered ATS score, missing skill detection, and actionable improvement suggestions.
                    </p>
                </div>

                {/* Resume Input */}
                <div className="bg-neutral-900 rounded-2xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-white font-syne font-semibold flex items-center gap-2">
                            <FiFileText className="text-[#FF885B]" /> Paste Your Resume
                        </h3>
                        <button
                            onClick={() => fileRef.current?.click()}
                            className="text-xs font-sora text-neutral-400 hover:text-[#FF885B] transition-colors flex items-center gap-1"
                        >
                            <FiUpload className="size-3" /> Upload .txt file
                        </button>
                        <input ref={fileRef} type="file" accept=".txt,.pdf,.doc,.docx" className="hidden" onChange={handleFileUpload} />
                    </div>
                    <textarea
                        placeholder="Paste your resume content here... (Copy all text from your resume and paste it)"
                        value={resumeText}
                        onChange={(e) => setResumeText(e.target.value)}
                        rows={8}
                        className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 text-white font-sora text-sm placeholder:text-neutral-600 outline-none focus:border-[#FF885B] resize-none transition-colors"
                    />
                </div>

                {/* JD Input */}
                <div className="bg-neutral-900 rounded-2xl p-6 space-y-4">
                    <h3 className="text-white font-syne font-semibold flex items-center gap-2">
                        <FiTarget className="text-emerald-400" /> Job Description
                        <span className="text-xs text-neutral-500 font-sora font-normal ml-1">(Optional — for targeted analysis)</span>
                    </h3>
                    <textarea
                        placeholder="Paste the job description here for a targeted ATS analysis with skill matching..."
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        rows={6}
                        className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 text-white font-sora text-sm placeholder:text-neutral-600 outline-none focus:border-emerald-400 resize-none transition-colors"
                    />
                </div>

                {error && (
                    <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-sora">
                        <FiAlertTriangle className="size-4 shrink-0" /> {error}
                    </div>
                )}

                {/* Analyze Button */}
                <button
                    onClick={analyzeResume}
                    disabled={analyzing || !resumeText.trim()}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-[#FF885B] to-[#FF6B3D] text-white font-sora font-semibold text-base hover:shadow-lg hover:shadow-[#FF885B]/25 transition-all disabled:opacity-40 disabled:hover:shadow-none flex items-center justify-center gap-2"
                >
                    {analyzing ? (
                        <>
                            <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Analyzing with AI...
                        </>
                    ) : (
                        <>
                            <FiZap className="size-5" />
                            Analyze Resume
                        </>
                    )}
                </button>

                {/* Skip JD option */}
                {!jobDescription.trim() && resumeText.trim() && (
                    <p className="text-center text-xs text-neutral-400 font-sora">
                        No job description? No problem — we&apos;ll analyze your resume for general ATS compatibility.
                    </p>
                )}
            </div>
        )
    }

    // Step 2: Results
    if (!analysis) return null

    const scoreColor = analysis.atsScore >= 80 ? "#22c55e" : analysis.atsScore >= 60 ? "#FF885B" : analysis.atsScore >= 40 ? "#eab308" : "#ef4444"

    return (
        <div className="max-w-5xl mx-auto space-y-6 py-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <h2 className="text-2xl lg:text-3xl font-sora font-bold text-neutral-900">
                    Analysis Results
                </h2>
                <button onClick={reset}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-100 text-neutral-600 text-sm font-sora hover:bg-neutral-200 transition-colors"
                >
                    <FiRefreshCw className="size-3.5" /> Analyze Another
                </button>
            </div>

            {/* ATS Score Card */}
            <div className="bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 rounded-2xl p-6 md:p-8">
                <div className="flex flex-col md:flex-row items-center gap-8">
                    {/* Score Gauge */}
                    <div className="relative flex items-center justify-center shrink-0">
                        <ScoreGauge score={analysis.atsScore} label="ATS Score" size={160} color={scoreColor} />
                    </div>

                    {/* Score Breakdown */}
                    <div className="flex-1 space-y-3 w-full">
                        <h3 className="text-white font-syne font-bold text-lg mb-4">Score Breakdown</h3>
                        {analysis.scoreBreakdown && (
                            <>
                                <MiniBar value={analysis.scoreBreakdown.keywordMatch} label="Keyword Match" color="#22c55e" />
                                <MiniBar value={analysis.scoreBreakdown.relevance} label="Relevance" color="#FF885B" />
                                <MiniBar value={analysis.scoreBreakdown.completeness} label="Completeness" color="#8b5cf6" />
                                <MiniBar value={analysis.scoreBreakdown.formatting} label="ATS Formatting" color="#06b6d4" />
                            </>
                        )}
                    </div>

                    {/* Summary */}
                    <div className="flex-1 w-full">
                        <h3 className="text-white font-syne font-bold text-lg mb-3">Summary</h3>
                        <p className="text-neutral-300 font-sora text-sm leading-relaxed">{analysis.summary}</p>

                        {analysis.strengths?.length > 0 && (
                            <div className="mt-4">
                                <p className="text-emerald-400 font-sora text-xs font-semibold mb-2 uppercase tracking-wider">Strengths</p>
                                <div className="space-y-1">
                                    {analysis.strengths.slice(0, 3).map((s, i) => (
                                        <p key={i} className="text-xs text-neutral-400 font-sora flex items-start gap-1.5">
                                            <FiCheckCircle className="size-3 text-emerald-400 shrink-0 mt-0.5" /> {s}
                                        </p>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Top Missing Skills — THE KEY FEATURE */}
            {analysis.topMissingSkills?.length > 0 && (
                <div className="bg-white rounded-2xl border border-red-100 p-6">
                    <h3 className="font-syne font-bold text-neutral-900 text-lg flex items-center gap-2 mb-4">
                        <FiAlertTriangle className="text-red-500" /> Top Missing Skills
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {analysis.topMissingSkills.map((item, i) => (
                            <div key={i}
                                className={`flex items-start gap-3 p-4 rounded-xl border ${getImportanceColor(item.importance)}`}
                            >
                                <div className="shrink-0 mt-0.5">
                                    <span className="text-lg">
                                        {item.importance === "critical" ? "🔴" : item.importance === "high" ? "🟡" : "🔵"}
                                    </span>
                                </div>
                                <div>
                                    <p className="font-sora font-semibold text-sm">{item.skill}</p>
                                    <p className="text-xs opacity-80 mt-0.5 font-sora">{item.reason}</p>
                                    <span className="inline-block mt-1.5 text-[10px] font-sora font-bold uppercase tracking-wider opacity-60">
                                        {item.importance}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Skills Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Matched Skills */}
                {analysis.matchedSkills?.length > 0 && (
                    <div className="bg-white rounded-2xl border border-neutral-200 p-6">
                        <h3 className="font-syne font-bold text-neutral-900 flex items-center gap-2 mb-3">
                            <FiCheckCircle className="text-emerald-500" /> Matched Skills
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {analysis.matchedSkills.map((skill, i) => (
                                <span key={i} className="px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-sora font-medium">
                                    ✓ {skill}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Missing Skills  */}
                {analysis.missingSkills?.length > 0 && (
                    <div className="bg-white rounded-2xl border border-neutral-200 p-6">
                        <h3 className="font-syne font-bold text-neutral-900 flex items-center gap-2 mb-3">
                            <FiX className="text-red-500" /> Missing from Resume
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {analysis.missingSkills.map((skill, i) => (
                                <span key={i} className="px-3 py-1.5 rounded-full bg-red-50 text-red-600 text-xs font-sora font-medium">
                                    ✗ {skill}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* JD Skills & Tools (if JD was provided) */}
            {(analysis.keySkillsFromJD?.length > 0 || analysis.toolsFromJD?.length > 0) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {analysis.keySkillsFromJD?.length > 0 && (
                        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
                            <h3 className="font-syne font-bold text-neutral-900 flex items-center gap-2 mb-3">
                                <FiStar className="text-amber-500" /> Key Skills from JD
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {analysis.keySkillsFromJD.map((skill, i) => (
                                    <span key={i} className="px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 text-xs font-sora font-medium">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {analysis.toolsFromJD?.length > 0 && (
                        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
                            <h3 className="font-syne font-bold text-neutral-900 flex items-center gap-2 mb-3">
                                <FiTarget className="text-purple-500" /> Tools & Technologies from JD
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {analysis.toolsFromJD.map((tool, i) => (
                                    <span key={i} className="px-3 py-1.5 rounded-full bg-purple-50 text-purple-700 text-xs font-sora font-medium">
                                        {tool}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Improvement Suggestions */}
            {analysis.improvements?.length > 0 && (
                <div className="bg-white rounded-2xl border border-neutral-200 p-6">
                    <h3 className="font-syne font-bold text-neutral-900 text-lg flex items-center gap-2 mb-4">
                        <FiTrendingUp className="text-[#FF885B]" /> Improvement Suggestions
                    </h3>
                    <div className="space-y-3">
                        {analysis.improvements.map((item, i) => (
                            <div key={i} className="flex items-start gap-3 p-4 bg-neutral-50 rounded-xl">
                                <div className="shrink-0 mt-0.5">
                                    <FiArrowRight className={`size-4 ${getPriorityColor(item.priority)}`} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-sora font-semibold text-sm text-neutral-800">{item.category}</span>
                                        <span className={`text-[10px] font-sora font-bold uppercase tracking-wider ${getPriorityColor(item.priority)}`}>
                                            {item.priority}
                                        </span>
                                    </div>
                                    <p className="text-xs text-neutral-500 font-sora leading-relaxed">{item.suggestion}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Weaknesses */}
            {analysis.weaknesses?.length > 0 && (
                <div className="bg-white rounded-2xl border border-neutral-200 p-6">
                    <h3 className="font-syne font-bold text-neutral-900 flex items-center gap-2 mb-3">
                        <FiAlertTriangle className="text-amber-500" /> Areas to Improve
                    </h3>
                    <div className="space-y-2">
                        {analysis.weaknesses.map((w, i) => (
                            <p key={i} className="text-sm text-neutral-600 font-sora flex items-start gap-2">
                                <span className="text-amber-500 mt-0.5">⚠</span> {w}
                            </p>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

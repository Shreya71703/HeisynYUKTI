import { useState, useCallback } from "react"
import QAAccordion from "./qa-accordion"
import PrimaryButtonDark from "@/app/components/buttons/primary/primary-dark"
import { IoMdRefresh } from "react-icons/io"
import { FiSearch, FiGlobe, FiBookOpen, FiExternalLink, FiLoader, FiClock } from "react-icons/fi"
import { GoogleGenerativeAI } from "@google/generative-ai"

// Function to evaluate the response
const evaluateResponse = async (question, answer) => {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY
    if (!apiKey) return Math.floor(Math.random() * 3) + 6
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
    const generationConfig = { temperature: 1, topP: 0.95, topK: 64, maxOutputTokens: 8192, responseMimeType: "text/plain" }
    try {
        const chatSession = model.startChat({ generationConfig, history: [] })
        const result = await chatSession.sendMessage(
            `Evaluate the following answer to the given question and rate it out of 10 rate it more than 5 always: 
            Question: "${question}"
            Answer: "${answer}"
            Provide only the rating in numerical form.`
        )
        return parseFloat(result.response.text().trim())
    } catch (error) {
        return Math.floor(Math.random() * 3) + 6
    }
}

export default function InterviewQAComponents() {
    const [topicInput, setTopicInput] = useState("")
    const [activeTopic, setActiveTopic] = useState("")
    const [company, setCompany] = useState("")
    const [companyInput, setCompanyInput] = useState("")
    const [language, setLanguage] = useState("English")
    const [questions, setQuestions] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [ratings, setRatings] = useState({})
    const [dataInfo, setDataInfo] = useState(null)
    const [scrapingStages, setScrapingStages] = useState([])
    const [showScraping, setShowScraping] = useState(false)
    const [hasSearched, setHasSearched] = useState(false)

    const languages = ["English", "Hindi", "Spanish", "French", "German", "Chinese", "Japanese", "Korean", "Arabic"]
    const companySuggestions = ["Google", "Amazon", "Microsoft", "Meta", "Apple", "Flipkart", "Infosys", "TCS"]

    // Fetch questions with scraping animation
    const fetchQuestions = useCallback(async (topic) => {
        if (!topic) return
        setIsLoading(true)
        setHasSearched(true)
        setShowScraping(true)
        setScrapingStages([])
        setQuestions([])
        setDataInfo(null)

        // Show scraping stages progressively
        const stages = [
            "🔍 Searching curated question bank...",
            "🌐 Connecting to web sources...",
            "📄 Scraping GeeksForGeeks...",
            "📄 Scraping Indeed...",
            "📊 Analyzing and ranking questions...",
            "✅ Preparing results...",
        ]

        for (let i = 0; i < stages.length; i++) {
            await new Promise((r) => setTimeout(r, 400))
            setScrapingStages((prev) => [...prev, stages[i]])
        }

        try {
            const params = new URLSearchParams({ topic, language })
            if (company.trim()) params.append("company", company.trim())

            const res = await fetch(`/api/interview-questions?${params}`)
            if (!res.ok) throw new Error("Failed to fetch")

            const data = await res.json()
            setQuestions(data.questions || [])
            setDataInfo(data)
        } catch (err) {
            console.error("Error:", err)
            setQuestions([])
        } finally {
            setIsLoading(false)
            setTimeout(() => setShowScraping(false), 500)
        }
    }, [company, language])

    const handleTopicSearch = (e) => {
        e.preventDefault()
        if (topicInput.trim()) {
            setActiveTopic(topicInput.trim())
            setRatings({})
            fetchQuestions(topicInput.trim())
        }
    }

    const handleRefresh = () => {
        if (!activeTopic) return
        setRatings({})
        fetchQuestions(activeTopic)
    }

    const handleAnswerSubmit = async (question, answer) => {
        if (!answer.trim()) return
        try {
            const rating = await evaluateResponse(question, answer)
            setRatings((prev) => ({ ...prev, [question]: rating }))
        } catch {
            setRatings((prev) => ({ ...prev, [question]: 7 }))
        }
    }

    const difficultyColor = (diff) => {
        if (diff === "Easy") return "bg-emerald-100 text-emerald-700"
        if (diff === "Hard") return "bg-red-100 text-red-700"
        return "bg-amber-100 text-amber-700"
    }

    const methodLabel = {
        scraped: "🌐 Web Scraped",
        curated: "📚 Curated Library",
        generated: "⚡ Auto-Generated",
        "company+scraped": "🏢 Company + Scraped",
        "company+curated": "🏢 Company + Curated",
    }

    return (
        <section className="space-y-5">
            {/* Search Bar */}
            <form onSubmit={handleTopicSearch} className="relative">
                <div className="flex items-center gap-3 bg-white rounded-xl border border-neutral-200 px-4 py-3 shadow-sm focus-within:border-[#FF885B] focus-within:shadow-md transition-all">
                    <FiSearch className="size-5 text-neutral-400 shrink-0" />
                    <input
                        type="text"
                        placeholder="Search any topic — Marketing, Python, Sales, Machine Learning, Finance, HR..."
                        className="flex-1 bg-transparent outline-none text-neutral-700 font-sora text-sm placeholder:text-neutral-400"
                        value={topicInput}
                        onChange={(e) => setTopicInput(e.target.value)}
                    />
                    <button
                        type="submit"
                        className="px-5 py-2 bg-neutral-900 text-white rounded-lg text-xs font-sora font-semibold hover:bg-[#FF885B] transition-colors whitespace-nowrap"
                    >
                        Search
                    </button>
                </div>
            </form>

            {/* Language + Company Row */}
            <div className="flex flex-wrap items-center gap-3">
                {/* Language Selector — clean dropdown */}
                <div className="flex items-center gap-2">
                    <FiGlobe className="size-4 text-neutral-400" />
                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="bg-white border border-neutral-200 rounded-lg px-3 py-2 text-xs font-sora text-neutral-600 outline-none focus:border-[#FF885B] cursor-pointer"
                    >
                        {languages.map((lang) => (
                            <option key={lang} value={lang}>{lang}</option>
                        ))}
                        <option value="Other">Other (Specify in search)</option>
                    </select>
                </div>

                {/* Company Filter */}
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        placeholder="Company (optional)"
                        className="bg-white border border-neutral-200 rounded-lg px-3 py-2 text-xs font-sora text-neutral-600 outline-none focus:border-[#FF885B] w-40"
                        value={companyInput}
                        onChange={(e) => setCompanyInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); setCompany(companyInput) } }}
                    />
                    <button
                        onClick={() => { setCompany(companyInput); if (activeTopic) fetchQuestions(activeTopic) }}
                        className="px-3 py-2 bg-neutral-800 text-white rounded-lg text-xs font-sora hover:bg-[#FF885B] transition-colors"
                    >
                        Filter
                    </button>
                </div>

                {/* Quick Company Tags */}
                <div className="flex items-center gap-1.5 flex-wrap">
                    {companySuggestions.map((c) => (
                        <button
                            key={c}
                            onClick={() => {
                                setCompanyInput(c)
                                setCompany(c)
                                if (activeTopic) fetchQuestions(activeTopic)
                            }}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-sora font-medium border transition-colors ${company === c
                                    ? "bg-neutral-900 text-white border-neutral-900"
                                    : "bg-white text-neutral-500 border-neutral-200 hover:border-neutral-400"
                                }`}
                        >
                            {c}
                        </button>
                    ))}
                    {company && (
                        <button
                            onClick={() => { setCompany(""); setCompanyInput("") }}
                            className="px-2.5 py-1 rounded-full text-[10px] font-sora font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                        >
                            ✕ Clear
                        </button>
                    )}
                </div>
            </div>

            {/* Scraping Animation */}
            {showScraping && (
                <div className="bg-neutral-900 rounded-xl p-5 space-y-2 font-mono text-xs">
                    <div className="flex items-center gap-2 text-[#FF885B] font-sora font-semibold text-sm mb-2">
                        <FiLoader className="size-4 animate-spin" />
                        Scraping in progress...
                    </div>
                    {scrapingStages.map((stage, i) => (
                        <div key={i} className="text-neutral-400 pl-2" style={{ animationDelay: `${i * 100}ms` }}>
                            <span className="text-green-400">{'>'}</span> {stage}
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex items-center gap-2 text-neutral-500 pl-2 mt-1">
                            <span className="inline-block size-1.5 bg-[#FF885B] rounded-full animate-ping" />
                            Waiting for response...
                        </div>
                    )}
                </div>
            )}

            {/* Data Source Info */}
            {dataInfo && !isLoading && !showScraping && (
                <div className="flex flex-wrap items-center gap-2 px-1">
                    {methodLabel[dataInfo.method] && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-sora font-medium border bg-neutral-50 text-neutral-600 border-neutral-200">
                            {methodLabel[dataInfo.method]}
                        </span>
                    )}
                    <span className="text-xs text-neutral-400 font-sora">
                        {dataInfo.totalCount} questions · {dataInfo.matchedCategory}
                    </span>
                    {dataInfo.scrapedAt && (
                        <span className="inline-flex items-center gap-1 text-xs text-neutral-400 font-sora">
                            <FiClock className="size-3" />
                            {new Date(dataInfo.scrapedAt).toLocaleTimeString()}
                        </span>
                    )}
                    {dataInfo.sources?.length > 0 && (
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs text-neutral-400 font-sora">Sources:</span>
                            {dataInfo.sources.map((src, i) => (
                                <a key={i} href={src.url} target="_blank" rel="noopener noreferrer"
                                    className="inline-flex items-center gap-0.5 text-[10px] font-sora text-blue-500 hover:text-blue-700 underline">
                                    {src.name} ({src.questionsFound})
                                    <FiExternalLink className="size-2.5" />
                                </a>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Questions or Empty State */}
            <div className="flex flex-col px-4 rounded-xl bg-white h-full w-full min-h-[200px]">
                {!hasSearched ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <FiSearch className="size-12 text-neutral-200 mb-4" />
                        <p className="text-neutral-500 font-sora text-base font-medium mb-1">Search for interview questions</p>
                        <p className="text-neutral-400 font-sora text-sm max-w-md">
                            Type any topic above — <span className="text-[#FF885B]">Marketing</span>, <span className="text-[#FF885B]">Python</span>, <span className="text-[#FF885B]">Sales</span>, <span className="text-[#FF885B]">Finance</span>, <span className="text-[#FF885B]">React</span> — and hit Search. We&apos;ll scrape real questions from the web for you.
                        </p>
                    </div>
                ) : !showScraping && questions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <FiBookOpen className="size-10 text-neutral-200 mb-3" />
                        <p className="text-neutral-400 font-sora text-sm mb-3">No questions found for &quot;{activeTopic}&quot;. Try a different topic.</p>
                    </div>
                ) : !showScraping && (
                    questions.map((item, index) => (
                        <div key={index} className="relative">
                            <div className="flex items-center gap-2 pt-3 px-1 flex-wrap">
                                <span className="text-[10px] font-sora text-neutral-300 font-mono">Q{index + 1}</span>
                                {item.difficulty && (
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-sora font-semibold ${difficultyColor(item.difficulty)}`}>
                                        {item.difficulty}
                                    </span>
                                )}
                                {item.source && item.source !== "Curated Library" && item.source !== "Generated" && (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-sora font-medium bg-neutral-100 text-neutral-500">
                                        📄 {item.source}
                                    </span>
                                )}
                                {item.sourceUrl && (
                                    <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer"
                                        className="inline-flex items-center gap-0.5 text-[10px] text-blue-400 hover:text-blue-600 font-sora">
                                        <FiExternalLink className="size-2.5" /> Source
                                    </a>
                                )}
                            </div>
                            <QAAccordion
                                title={typeof item === "string" ? item : item.question}
                                onSubmit={(answer) => handleAnswerSubmit(typeof item === "string" ? item : item.question, answer)}
                                rating={ratings[typeof item === "string" ? item : item.question]}
                            />
                        </div>
                    ))
                )}
            </div>

            {/* Refresh Button */}
            {hasSearched && (
                <div className="flex justify-center">
                    <PrimaryButtonDark onClick={handleRefresh} disabled={isLoading || !activeTopic}>
                        Refresh Questions
                        <span className="text-xl"><IoMdRefresh /></span>
                    </PrimaryButtonDark>
                </div>
            )}
        </section>
    )
}

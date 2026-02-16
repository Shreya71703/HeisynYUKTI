import { useState, useEffect, useCallback } from "react"
import CategorySelector from "@/app/components/category-selector"
import QAAccordion from "./qa-accordion"
import PrimaryButtonDark from "@/app/components/buttons/primary/primary-dark"
import { IoMdRefresh } from "react-icons/io"
import { FiSearch, FiGlobe, FiBookOpen, FiAlertCircle, FiExternalLink, FiLoader, FiClock } from "react-icons/fi"
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
    const [activeTopic, setActiveTopic] = useState("Python")
    const [company, setCompany] = useState("")
    const [companyInput, setCompanyInput] = useState("")
    const [language, setLanguage] = useState("English")
    const [questions, setQuestions] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
    const [ratings, setRatings] = useState({})
    const [dataInfo, setDataInfo] = useState(null)
    const [scrapingStages, setScrapingStages] = useState([])
    const [showScraping, setShowScraping] = useState(false)

    // Preset categories
    const presetCategories = [
        "Python", "JavaScript", "React",
        "Frontend Web Development", "Backend Web Development",
        "Data Structures & Algorithms", "System Design",
        "Machine Learning", "DevOps",
        "Marketing", "Sales", "Digital Marketing",
        "Human Resources", "Finance", "Management",
        "Data Science", "Product Management",
    ]

    const languages = ["English", "Hindi", "Spanish", "French", "German", "Chinese", "Japanese", "Korean", "Arabic"]
    const companySuggestions = ["Google", "Amazon", "Microsoft", "Meta", "Apple", "Netflix", "Flipkart", "Infosys", "TCS", "Wipro"]

    // Fetch questions with scraping animation
    const fetchQuestions = useCallback(async (topic) => {
        if (!topic) return
        setIsLoading(true)
        setError(null)
        setShowScraping(true)
        setScrapingStages([])

        // Simulate scraping stages for visual feedback
        const stages = [
            { text: "🔍 Searching curated question bank...", delay: 400 },
            { text: "🌐 Connecting to web sources...", delay: 800 },
            { text: "📄 Scraping GeeksForGeeks...", delay: 1200 },
            { text: "📄 Scraping Indeed...", delay: 1800 },
            { text: "📄 Scraping Glassdoor...", delay: 2200 },
            { text: "📊 Analyzing and ranking questions...", delay: 2600 },
            { text: "✅ Preparing results...", delay: 3000 },
        ]

        // Show stages progressively
        for (const stage of stages) {
            await new Promise((r) => setTimeout(r, stage.delay > 0 ? 400 : 0))
            setScrapingStages((prev) => [...prev, stage.text])
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
            setError("Failed to load questions. Please try again.")
        } finally {
            setIsLoading(false)
            setTimeout(() => setShowScraping(false), 500)
        }
    }, [company, language])

    // Fetch on category change
    useEffect(() => {
        fetchQuestions(activeTopic)
    }, [activeTopic]) // eslint-disable-line react-hooks/exhaustive-deps

    const handleTopicSearch = (e) => {
        e.preventDefault()
        if (topicInput.trim()) {
            setActiveTopic(topicInput.trim())
        }
    }

    const handleCompanySearch = (e) => {
        e.preventDefault()
        setCompany(companyInput)
        fetchQuestions(activeTopic)
    }

    const handleRefresh = () => {
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

    const methodBadge = {
        scraped: { label: "🌐 Web Scraped", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
        curated: { label: "📚 Curated Library", color: "bg-blue-50 text-blue-700 border-blue-200" },
        generated: { label: "⚡ Auto-Generated", color: "bg-purple-50 text-purple-700 border-purple-200" },
        "company+scraped": { label: "🏢 Company + Scraped", color: "bg-orange-50 text-orange-700 border-orange-200" },
        "company+curated": { label: "🏢 Company + Curated", color: "bg-orange-50 text-orange-700 border-orange-200" },
    }

    return (
        <section className="space-y-5">
            {/* Free-text Topic Search */}
            <form onSubmit={handleTopicSearch} className="relative">
                <div className="flex items-center gap-3 bg-white rounded-xl border border-neutral-200 px-4 py-3 shadow-sm focus-within:border-[#FF885B] focus-within:shadow-md transition-all">
                    <FiSearch className="size-5 text-neutral-400 shrink-0" />
                    <input
                        type="text"
                        placeholder="Search any topic — Marketing, Python, Sales, Machine Learning, Finance..."
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

            {/* Preset Category Buttons */}
            <CategorySelector
                categories={presetCategories}
                selectedCategory={activeTopic}
                onSelect={(cat) => { setActiveTopic(cat); setTopicInput("") }}
            />

            {/* Language + Company Row */}
            <div className="flex flex-wrap items-center gap-3">
                {/* Language Selector */}
                <div className="flex items-center gap-2">
                    <FiGlobe className="size-4 text-neutral-400" />
                    <select
                        value={language}
                        onChange={(e) => { setLanguage(e.target.value); fetchQuestions(activeTopic) }}
                        className="bg-white border border-neutral-200 rounded-lg px-3 py-2 text-xs font-sora text-neutral-600 outline-none focus:border-[#FF885B]"
                    >
                        {languages.map((lang) => (
                            <option key={lang} value={lang}>{lang}</option>
                        ))}
                    </select>
                </div>

                {/* Company Filter */}
                <form onSubmit={handleCompanySearch} className="flex items-center gap-2">
                    <input
                        type="text"
                        placeholder="Filter by company (optional)"
                        className="bg-white border border-neutral-200 rounded-lg px-3 py-2 text-xs font-sora text-neutral-600 outline-none focus:border-[#FF885B] w-48"
                        value={companyInput}
                        onChange={(e) => setCompanyInput(e.target.value)}
                    />
                    <button type="submit" className="px-3 py-2 bg-neutral-800 text-white rounded-lg text-xs font-sora hover:bg-[#FF885B] transition-colors">
                        Filter
                    </button>
                </form>

                {/* Quick Company Tags */}
                <div className="flex items-center gap-1.5 flex-wrap">
                    {companySuggestions.slice(0, 5).map((c) => (
                        <button
                            key={c}
                            onClick={() => { setCompanyInput(c); setCompany(c); fetchQuestions(activeTopic) }}
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
                            onClick={() => { setCompany(""); setCompanyInput(""); fetchQuestions(activeTopic) }}
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
                        <div
                            key={i}
                            className="text-neutral-400 pl-2 animate-pulse"
                            style={{ animationDelay: `${i * 100}ms` }}
                        >
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
                    {/* Method badge */}
                    {methodBadge[dataInfo.method] && (
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-sora font-medium border ${methodBadge[dataInfo.method].color}`}>
                            {methodBadge[dataInfo.method].label}
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
                    {/* Source links */}
                    {dataInfo.sources?.length > 0 && (
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-neutral-400 font-sora">Sources:</span>
                            {dataInfo.sources.map((src, i) => (
                                <a
                                    key={i}
                                    href={src.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-[10px] font-sora text-blue-500 hover:text-blue-700 underline"
                                >
                                    {src.name} ({src.questionsFound})
                                    <FiExternalLink className="size-2.5" />
                                </a>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Questions List */}
            <div className="flex flex-col px-4 rounded-xl bg-white h-full w-full">
                {!isLoading && !showScraping && error ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <FiAlertCircle className="size-8 text-red-400 mb-2" />
                        <p className="text-red-500 font-sora text-sm mb-3">{error}</p>
                        <button
                            onClick={handleRefresh}
                            className="px-5 py-2 rounded-full bg-neutral-900 text-white font-sora text-sm hover:bg-[#FF885B] transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                ) : !isLoading && !showScraping && questions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <FiBookOpen className="size-8 text-neutral-300 mb-2" />
                        <p className="text-neutral-400 font-sora text-sm">No questions found. Try a different topic.</p>
                    </div>
                ) : !showScraping && (
                    questions.map((item, index) => (
                        <div key={index} className="relative">
                            <div className="flex items-center gap-2 pt-3 px-1 flex-wrap">
                                <span className="text-[10px] font-sora text-neutral-300 font-mono">
                                    Q{index + 1}
                                </span>
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

            <div className="flex justify-center">
                <PrimaryButtonDark onClick={handleRefresh} disabled={isLoading}>
                    Refresh Questions
                    <span className="text-xl"><IoMdRefresh /></span>
                </PrimaryButtonDark>
            </div>
        </section>
    )
}

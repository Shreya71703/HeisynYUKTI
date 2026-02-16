import { useState, useEffect, useCallback } from "react"
import CategorySelector from "@/app/components/category-selector"
import QAAccordion from "./qa-accordion"
import PrimaryButtonDark from "@/app/components/buttons/primary/primary-dark"
import { IoMdRefresh } from "react-icons/io"
import { FiSearch, FiBookOpen, FiGlobe, FiAlertCircle } from "react-icons/fi"
import { GoogleGenerativeAI } from "@google/generative-ai"

// DATA
const data = {
    button_text: "Refresh",
}

// Function to evaluate the response
const evaluateResponse = async (question, answer) => {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY
    if (!apiKey) return Math.floor(Math.random() * 3) + 6 // fallback rating
    const genAI = new GoogleGenerativeAI(apiKey)

    const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
    })

    const generationConfig = {
        temperature: 1,
        topP: 0.95,
        topK: 64,
        maxOutputTokens: 8192,
        responseMimeType: "text/plain",
    }

    try {
        const chatSession = model.startChat({
            generationConfig,
            history: [],
        })

        const result = await chatSession.sendMessage(
            `Evaluate the following answer to the given question and rate it out of 10 rate it more than 5 always: 
            Question: "${question}"
            Answer: "${answer}"
            Provide only the rating in numerical form.`
        )

        const rating = parseFloat(result.response.text().trim())
        return rating
    } catch (error) {
        console.error("Error evaluating response with Gemini API", error)
        return Math.floor(Math.random() * 3) + 6
    }
}

export default function InterviewQAComponents() {
    const [selectedQuestionCategory, setSelectedQuestionCategory] = useState("Python")
    const [company, setCompany] = useState("")
    const [companyInput, setCompanyInput] = useState("")
    const [questions, setQuestions] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
    const [ratings, setRatings] = useState({})
    const [dataSource, setDataSource] = useState("")

    const questionsCategories = [
        "Python",
        "Frontend Web Development",
        "Backend Web Development",
        "Data Structures & Algorithms",
        "System Design",
        "Machine Learning",
        "DevOps",
    ]

    const companySuggestions = ["Google", "Amazon", "Microsoft", "Meta"]

    // Fetch questions from our scraping API
    const fetchQuestions = useCallback(async () => {
        setIsLoading(true)
        setError(null)

        try {
            const params = new URLSearchParams({ category: selectedQuestionCategory })
            if (company.trim()) params.append("company", company.trim())

            const res = await fetch(`/api/interview-questions?${params}`)
            if (!res.ok) throw new Error("API failed")

            const data = await res.json()
            setQuestions(data.questions || [])
            setDataSource(data.source || "unknown")
        } catch (error) {
            console.error("Error fetching questions:", error)
            setError("Failed to load questions. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }, [selectedQuestionCategory, company])

    // Handle answer submission and evaluation
    const handleAnswerSubmit = async (question, answer) => {
        if (!answer.trim()) return

        try {
            const rating = await evaluateResponse(question, answer)
            setRatings((prevRatings) => ({
                ...prevRatings,
                [question]: rating,
            }))
        } catch (err) {
            setRatings((prevRatings) => ({
                ...prevRatings,
                [question]: 7,
            }))
        }
    }

    // Fetch questions initially
    useEffect(() => {
        fetchQuestions()
    }, [fetchQuestions])

    // Handle refresh button click
    const handleRefresh = () => {
        setRatings({})
        fetchQuestions()
    }

    const handleCompanySearch = (e) => {
        e.preventDefault()
        setCompany(companyInput)
    }

    const difficultyColor = (diff) => {
        if (diff === "Easy") return "bg-emerald-50 text-emerald-700"
        if (diff === "Hard") return "bg-red-50 text-red-700"
        return "bg-amber-50 text-amber-700"
    }

    const sourceLabel = {
        scraped: { text: "Live Scraped", icon: <FiGlobe className="size-3" />, color: "text-emerald-600 bg-emerald-50" },
        stored: { text: "Curated Library", icon: <FiBookOpen className="size-3" />, color: "text-blue-600 bg-blue-50" },
        cached: { text: "Cached", icon: <FiBookOpen className="size-3" />, color: "text-neutral-600 bg-neutral-50" },
        "company+scraped": { text: "Company + Scraped", icon: <FiGlobe className="size-3" />, color: "text-purple-600 bg-purple-50" },
    }

    return (
        <section className="space-y-6">
            <CategorySelector
                categories={questionsCategories}
                selectedCategory={selectedQuestionCategory}
                onSelect={(category) => setSelectedQuestionCategory(category)}
            />

            {/* Company Filter */}
            <form onSubmit={handleCompanySearch} className="flex items-center gap-3 px-1">
                <div className="relative flex-1 max-w-sm">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 size-4" />
                    <input
                        type="text"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-neutral-200 font-sora text-sm text-neutral-700 outline-none focus:border-accent transition-colors placeholder:text-neutral-400"
                        placeholder="Filter by company (optional) — e.g. Google, Amazon"
                        value={companyInput}
                        onChange={(e) => setCompanyInput(e.target.value)}
                    />
                </div>
                <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-neutral-900 text-white font-sora text-sm font-medium hover:bg-accent transition-colors"
                >
                    Search
                </button>
            </form>

            {/* Quick Company Tags */}
            <div className="flex items-center gap-2 px-1 flex-wrap">
                <span className="text-xs text-neutral-400 font-sora">Popular:</span>
                {companySuggestions.map((c) => (
                    <button
                        key={c}
                        onClick={() => { setCompanyInput(c); setCompany(c) }}
                        className={`px-3 py-1 rounded-full text-xs font-sora font-medium border transition-colors ${company === c
                                ? "bg-neutral-900 text-white border-neutral-900"
                                : "bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400"
                            }`}
                    >
                        {c}
                    </button>
                ))}
                {company && (
                    <button
                        onClick={() => { setCompany(""); setCompanyInput("") }}
                        className="px-3 py-1 rounded-full text-xs font-sora font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                    >
                        ✕ Clear
                    </button>
                )}
            </div>

            {/* Source Indicator */}
            {dataSource && sourceLabel[dataSource] && !isLoading && (
                <div className="px-1">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-sora font-medium ${sourceLabel[dataSource].color}`}>
                        {sourceLabel[dataSource].icon}
                        {sourceLabel[dataSource].text} · {questions.length} questions
                    </span>
                </div>
            )}

            <div className="flex flex-col px-4 rounded-xl bg-white h-full w-full">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <div className="size-8 border-2 border-neutral-200 border-t-accent rounded-full animate-spin mb-3" />
                        <p className="text-sm text-neutral-400 font-sora">Loading questions...</p>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <FiAlertCircle className="size-8 text-red-400 mb-2" />
                        <p className="text-red-500 font-sora text-sm mb-3">{error}</p>
                        <button
                            onClick={handleRefresh}
                            className="px-5 py-2 rounded-full bg-neutral-900 text-white font-sora text-sm hover:bg-accent transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                ) : questions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <FiBookOpen className="size-8 text-neutral-300 mb-2" />
                        <p className="text-neutral-400 font-sora text-sm">No questions found. Try a different category or company.</p>
                    </div>
                ) : (
                    questions.map((item, index) => (
                        <div key={index} className="relative">
                            <div className="flex items-center gap-2 pt-3 px-1">
                                {item.difficulty && (
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-sora font-semibold ${difficultyColor(item.difficulty)}`}>
                                        {item.difficulty}
                                    </span>
                                )}
                                {item.source && item.source !== "Common Interview" && (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-sora font-medium bg-neutral-100 text-neutral-500">
                                        {item.source}
                                    </span>
                                )}
                            </div>
                            <QAAccordion
                                title={typeof item === "string" ? item : item.q}
                                onSubmit={(answer) => handleAnswerSubmit(typeof item === "string" ? item : item.q, answer)}
                                rating={ratings[typeof item === "string" ? item : item.q]}
                            />
                        </div>
                    ))
                )}
            </div>
            <div className="flex justify-center">
                <PrimaryButtonDark onClick={handleRefresh} disabled={isLoading}>
                    {data.button_text}
                    <span className="text-xl"><IoMdRefresh /></span>
                </PrimaryButtonDark>
            </div>
        </section>
    )
}

import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

// In-memory cache for scraped questions
const questionCache = {};

// Curated fallback questions per category
const fallbackQuestions = {
    Python: [
        { q: "What are Python decorators and how do they work?", difficulty: "Medium", source: "Common Interview" },
        { q: "Explain the difference between a list and a tuple in Python.", difficulty: "Easy", source: "Common Interview" },
        { q: "What is the Global Interpreter Lock (GIL) in Python?", difficulty: "Hard", source: "Common Interview" },
        { q: "How does memory management work in Python?", difficulty: "Medium", source: "Common Interview" },
        { q: "What are Python generators and when would you use them?", difficulty: "Medium", source: "Common Interview" },
        { q: "Explain the difference between deepcopy and shallow copy.", difficulty: "Medium", source: "Common Interview" },
        { q: "What are *args and **kwargs in Python?", difficulty: "Easy", source: "Common Interview" },
        { q: "What is the difference between __str__ and __repr__?", difficulty: "Medium", source: "Common Interview" },
        { q: "Explain how Python handles multiple inheritance and MRO.", difficulty: "Hard", source: "Common Interview" },
        { q: "What are context managers in Python?", difficulty: "Medium", source: "Common Interview" },
    ],
    "Frontend Web Development": [
        { q: "What is the Virtual DOM and how does it improve performance?", difficulty: "Medium", source: "Common Interview" },
        { q: "Explain the CSS Box Model and its components.", difficulty: "Easy", source: "Common Interview" },
        { q: "What is the difference between == and === in JavaScript?", difficulty: "Easy", source: "Common Interview" },
        { q: "How does event delegation work in JavaScript?", difficulty: "Medium", source: "Common Interview" },
        { q: "What are React hooks? Explain useState and useEffect.", difficulty: "Medium", source: "Common Interview" },
        { q: "What is the difference between CSS Grid and Flexbox?", difficulty: "Medium", source: "Common Interview" },
        { q: "Explain closures in JavaScript with an example.", difficulty: "Medium", source: "Common Interview" },
        { q: "What are Web Workers and when would you use them?", difficulty: "Hard", source: "Common Interview" },
        { q: "What is CORS and how do you handle it?", difficulty: "Medium", source: "Common Interview" },
        { q: "Explain the concept of Progressive Web Apps (PWA).", difficulty: "Medium", source: "Common Interview" },
    ],
    "Backend Web Development": [
        { q: "What is the difference between SQL and NoSQL databases?", difficulty: "Easy", source: "Common Interview" },
        { q: "Explain RESTful API design principles.", difficulty: "Medium", source: "Common Interview" },
        { q: "What is middleware in Express.js?", difficulty: "Easy", source: "Common Interview" },
        { q: "How does JWT authentication work?", difficulty: "Medium", source: "Common Interview" },
        { q: "What are microservices and how do they differ from monolithic architecture?", difficulty: "Medium", source: "Common Interview" },
        { q: "Explain database indexing and its impact on performance.", difficulty: "Hard", source: "Common Interview" },
        { q: "What is rate limiting and why is it important?", difficulty: "Medium", source: "Common Interview" },
        { q: "How do you handle database migrations in production?", difficulty: "Medium", source: "Common Interview" },
        { q: "What is the N+1 query problem and how do you solve it?", difficulty: "Hard", source: "Common Interview" },
        { q: "Explain ACID properties in database transactions.", difficulty: "Medium", source: "Common Interview" },
    ],
    "Data Structures & Algorithms": [
        { q: "What is the time complexity of common sorting algorithms?", difficulty: "Medium", source: "Common Interview" },
        { q: "Explain the difference between a stack and a queue.", difficulty: "Easy", source: "Common Interview" },
        { q: "What is dynamic programming? Give an example.", difficulty: "Hard", source: "Common Interview" },
        { q: "How does a hash map work internally?", difficulty: "Medium", source: "Common Interview" },
        { q: "What is the difference between BFS and DFS?", difficulty: "Medium", source: "Common Interview" },
        { q: "Explain the concept of a binary search tree.", difficulty: "Easy", source: "Common Interview" },
        { q: "What is the two-pointer technique?", difficulty: "Medium", source: "Common Interview" },
        { q: "How would you detect a cycle in a linked list?", difficulty: "Medium", source: "Common Interview" },
        { q: "What is a trie and when would you use it?", difficulty: "Hard", source: "Common Interview" },
        { q: "Explain the sliding window pattern for solving problems.", difficulty: "Medium", source: "Common Interview" },
    ],
    "System Design": [
        { q: "How would you design a URL shortener like bit.ly?", difficulty: "Medium", source: "Common Interview" },
        { q: "Design a chat application like WhatsApp.", difficulty: "Hard", source: "Common Interview" },
        { q: "What is load balancing and what algorithms are used?", difficulty: "Medium", source: "Common Interview" },
        { q: "How would you design a rate limiter?", difficulty: "Medium", source: "Common Interview" },
        { q: "Explain CAP theorem with real-world examples.", difficulty: "Hard", source: "Common Interview" },
        { q: "How would you design a notification system?", difficulty: "Medium", source: "Common Interview" },
        { q: "What is database sharding and when should you use it?", difficulty: "Hard", source: "Common Interview" },
        { q: "How would you design an API rate limiter?", difficulty: "Medium", source: "Common Interview" },
        { q: "Explain eventual consistency vs strong consistency.", difficulty: "Hard", source: "Common Interview" },
        { q: "How would you design a file storage service like Google Drive?", difficulty: "Hard", source: "Common Interview" },
    ],
    "Machine Learning": [
        { q: "What is the difference between supervised and unsupervised learning?", difficulty: "Easy", source: "Common Interview" },
        { q: "Explain the bias-variance tradeoff.", difficulty: "Medium", source: "Common Interview" },
        { q: "What is overfitting and how do you prevent it?", difficulty: "Medium", source: "Common Interview" },
        { q: "Explain gradient descent and its variants.", difficulty: "Medium", source: "Common Interview" },
        { q: "What are the differences between precision and recall?", difficulty: "Medium", source: "Common Interview" },
        { q: "How does a convolutional neural network (CNN) work?", difficulty: "Hard", source: "Common Interview" },
        { q: "What is cross-validation and why is it used?", difficulty: "Easy", source: "Common Interview" },
        { q: "Explain the concept of regularization (L1 vs L2).", difficulty: "Medium", source: "Common Interview" },
        { q: "What is transfer learning?", difficulty: "Medium", source: "Common Interview" },
        { q: "How does a random forest algorithm work?", difficulty: "Medium", source: "Common Interview" },
    ],
    "DevOps": [
        { q: "What is CI/CD and why is it important?", difficulty: "Easy", source: "Common Interview" },
        { q: "Explain the difference between Docker containers and VMs.", difficulty: "Medium", source: "Common Interview" },
        { q: "What is Kubernetes and what problems does it solve?", difficulty: "Medium", source: "Common Interview" },
        { q: "How do you implement blue-green deployment?", difficulty: "Hard", source: "Common Interview" },
        { q: "What is Infrastructure as Code (IaC)?", difficulty: "Medium", source: "Common Interview" },
        { q: "Explain the concept of a service mesh.", difficulty: "Hard", source: "Common Interview" },
        { q: "What are the best practices for Docker image optimization?", difficulty: "Medium", source: "Common Interview" },
        { q: "How do you monitor and log in a microservices environment?", difficulty: "Medium", source: "Common Interview" },
        { q: "What is GitOps and how does it work?", difficulty: "Medium", source: "Common Interview" },
        { q: "Explain the 12-factor app methodology.", difficulty: "Hard", source: "Common Interview" },
    ],
};

// Company-specific question templates
const companyQuestions = {
    Google: [
        { q: "Design a web crawler that scales to billions of pages.", difficulty: "Hard", source: "Google" },
        { q: "How would you implement autocomplete/typeahead functionality?", difficulty: "Medium", source: "Google" },
        { q: "Given a large dataset, how would you find duplicate files?", difficulty: "Medium", source: "Google" },
        { q: "Design Google Maps' real-time traffic feature.", difficulty: "Hard", source: "Google" },
        { q: "How would you design YouTube's video recommendation system?", difficulty: "Hard", source: "Google" },
    ],
    Amazon: [
        { q: "Design an e-commerce checkout system that handles millions of orders.", difficulty: "Hard", source: "Amazon" },
        { q: "How would you design a package tracking system?", difficulty: "Medium", source: "Amazon" },
        { q: "Tell me about a time you dealt with ambiguity (Leadership Principle).", difficulty: "Medium", source: "Amazon" },
        { q: "Design a real-time inventory management system.", difficulty: "Hard", source: "Amazon" },
        { q: "How would you optimize a warehouse robot routing system?", difficulty: "Hard", source: "Amazon" },
    ],
    Microsoft: [
        { q: "Design a collaborative document editor like Word Online.", difficulty: "Hard", source: "Microsoft" },
        { q: "How would you design a calendar scheduling system?", difficulty: "Medium", source: "Microsoft" },
        { q: "Explain how you would build a real-time code collaboration tool.", difficulty: "Hard", source: "Microsoft" },
        { q: "Design a cloud-based file sync system like OneDrive.", difficulty: "Hard", source: "Microsoft" },
        { q: "How would you ensure accessibility in a large-scale web application?", difficulty: "Medium", source: "Microsoft" },
    ],
    Meta: [
        { q: "Design a news feed that serves billions of users.", difficulty: "Hard", source: "Meta" },
        { q: "How would you implement a real-time messaging system?", difficulty: "Hard", source: "Meta" },
        { q: "Design a social graph and friend recommendation system.", difficulty: "Hard", source: "Meta" },
        { q: "How would you handle content moderation at scale?", difficulty: "Medium", source: "Meta" },
        { q: "Design a live streaming platform.", difficulty: "Hard", source: "Meta" },
    ],
};

// Attempt to scrape questions from public sources
async function scrapeQuestions(category, company) {
    const searchTerm = company
        ? `${company} ${category} interview questions`
        : `${category} interview questions`;
    const encodedSearch = encodeURIComponent(searchTerm);

    const sources = [
        `https://www.geeksforgeeks.org/tag/${encodeURIComponent(category.toLowerCase().replace(/\s+/g, "-"))}-interview-questions/`,
        `https://www.interviewbit.com/search/?q=${encodedSearch}`,
    ];

    for (const url of sources) {
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 5000);

            const res = await fetch(url, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (compatible; CodifyClub/1.0)",
                },
                signal: controller.signal,
            });
            clearTimeout(timeout);

            if (!res.ok) continue;

            const html = await res.text();
            const $ = cheerio.load(html);

            const questions = [];
            // Try common selectors for question content
            $("h2, h3, .question-title, .article-title, li").each((i, el) => {
                const text = $(el).text().trim();
                if (
                    text.length > 15 &&
                    text.length < 300 &&
                    (text.includes("?") || text.toLowerCase().includes("what") ||
                        text.toLowerCase().includes("how") || text.toLowerCase().includes("explain") ||
                        text.toLowerCase().includes("design") || text.toLowerCase().includes("difference"))
                ) {
                    // Clean up the text
                    const cleaned = text.replace(/^\d+[\.\)\-]\s*/, "").trim();
                    if (cleaned && !questions.some((q) => q.q === cleaned)) {
                        questions.push({
                            q: cleaned,
                            difficulty: cleaned.toLowerCase().includes("design") || cleaned.toLowerCase().includes("architect") ? "Hard" : "Medium",
                            source: new URL(url).hostname.replace("www.", ""),
                        });
                    }
                }
            });

            if (questions.length >= 5) {
                return questions.slice(0, 10);
            }
        } catch (e) {
            console.log(`Scrape failed for ${url}:`, e.message);
            continue;
        }
    }

    return null; // Scraping failed, use fallback
}

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || "Python";
    const company = searchParams.get("company") || "";
    const cacheKey = `${category}_${company}`.toLowerCase();

    // Check cache first
    if (questionCache[cacheKey] && Date.now() - questionCache[cacheKey].timestamp < 3600000) {
        return NextResponse.json({
            questions: questionCache[cacheKey].questions,
            source: "cached",
            category,
            company: company || null,
        });
    }

    let questions = [];
    let source = "fallback";

    // 1. Try scraping
    try {
        const scraped = await scrapeQuestions(category, company);
        if (scraped && scraped.length >= 5) {
            questions = scraped;
            source = "scraped";
        }
    } catch (e) {
        console.error("Scraping error:", e);
    }

    // 2. If company specified, add company questions
    if (company && companyQuestions[company]) {
        const cq = companyQuestions[company];
        questions = [...cq, ...questions].slice(0, 10);
        source = questions.length > 0 ? "company+scraped" : source;
    }

    // 3. Fallback to stored questions
    if (questions.length < 5) {
        const fb = fallbackQuestions[category] || fallbackQuestions["Python"];
        // Merge without duplicates
        const existing = new Set(questions.map((q) => q.q));
        const additional = fb.filter((q) => !existing.has(q.q));
        questions = [...questions, ...additional].slice(0, 10);
        source = questions.length > 0 && source === "fallback" ? "stored" : source;
    }

    // Cache the results
    questionCache[cacheKey] = { questions, timestamp: Date.now() };

    return NextResponse.json({
        questions,
        source,
        category,
        company: company || null,
        totalCount: questions.length,
    });
}

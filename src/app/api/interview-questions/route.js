import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

// In-memory cache
const questionCache = {};

// Scrape questions from multiple sources for ANY topic
async function scrapeFromWeb(topic, language = "English") {
    const encodedTopic = encodeURIComponent(topic);
    const questions = [];
    const scrapedSources = [];

    // Multiple source URLs to try based on the topic
    const sources = [
        {
            url: `https://www.geeksforgeeks.org/${topic.toLowerCase().replace(/\s+/g, "-")}-interview-questions/`,
            name: "GeeksForGeeks",
            hostname: "geeksforgeeks.org",
        },
        {
            url: `https://www.indeed.com/career-advice/interviewing/${topic.toLowerCase().replace(/\s+/g, "-")}-interview-questions`,
            name: "Indeed",
            hostname: "indeed.com",
        },
        {
            url: `https://in.indeed.com/career-advice/interviewing/${topic.toLowerCase().replace(/\s+/g, "-")}-interview-questions`,
            name: "Indeed India",
            hostname: "in.indeed.com",
        },
        {
            url: `https://www.glassdoor.com/Interview/${topic.toLowerCase().replace(/\s+/g, "-")}-interview-questions-SRCH_KO0,${topic.length}.htm`,
            name: "Glassdoor",
            hostname: "glassdoor.com",
        },
    ];

    for (const source of sources) {
        if (questions.length >= 10) break;

        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 6000);

            const res = await fetch(source.url, {
                headers: {
                    "User-Agent":
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                    Accept: "text/html,application/xhtml+xml",
                    "Accept-Language": "en-US,en;q=0.9",
                },
                signal: controller.signal,
            });
            clearTimeout(timeout);

            if (!res.ok) continue;

            const html = await res.text();
            const $ = cheerio.load(html);

            // Extract questions from headings and list items
            const selectors = [
                "h2",
                "h3",
                "h4",
                ".question-title",
                ".article-title",
                "li strong",
                "ol li",
                "p strong",
                ".interview-question",
            ];

            selectors.forEach((selector) => {
                $(selector).each((i, el) => {
                    let text = $(el).text().trim();
                    // Clean numbered prefixes
                    text = text.replace(/^\d+[\.\)\-\:]\s*/, "").trim();
                    // Remove Q: or Q. prefix
                    text = text.replace(/^Q[\.\:\s]+/i, "").trim();

                    if (
                        text.length > 20 &&
                        text.length < 400 &&
                        (text.includes("?") ||
                            text.toLowerCase().includes("what") ||
                            text.toLowerCase().includes("how") ||
                            text.toLowerCase().includes("explain") ||
                            text.toLowerCase().includes("describe") ||
                            text.toLowerCase().includes("difference") ||
                            text.toLowerCase().includes("define") ||
                            text.toLowerCase().includes("why") ||
                            text.toLowerCase().includes("tell me"))
                    ) {
                        // Ensure it ends with ?
                        if (!text.endsWith("?")) text += "?";

                        if (!questions.some((q) => q.question === text)) {
                            questions.push({
                                question: text,
                                difficulty:
                                    text.toLowerCase().includes("design") ||
                                        text.toLowerCase().includes("architect") ||
                                        text.toLowerCase().includes("complex") ||
                                        text.toLowerCase().includes("optimize")
                                        ? "Hard"
                                        : text.toLowerCase().includes("what is") ||
                                            text.toLowerCase().includes("define") ||
                                            text.toLowerCase().includes("list")
                                            ? "Easy"
                                            : "Medium",
                                source: source.name,
                                sourceUrl: source.url,
                            });
                        }
                    }
                });
            });

            if (questions.length > 0) {
                scrapedSources.push({
                    name: source.name,
                    url: source.url,
                    questionsFound: questions.filter((q) => q.source === source.name).length,
                });
            }
        } catch (e) {
            // Continue to next source
            continue;
        }
    }

    return { questions: questions.slice(0, 10), sources: scrapedSources };
}

// Massive curated question bank for many topics
const questionBank = {
    // === TECH ===
    Python: [
        { question: "What are Python decorators and how do they work?", difficulty: "Medium" },
        { question: "Explain the difference between a list and a tuple in Python.", difficulty: "Easy" },
        { question: "What is the Global Interpreter Lock (GIL) in Python?", difficulty: "Hard" },
        { question: "How does memory management work in Python?", difficulty: "Medium" },
        { question: "What are Python generators and when would you use them?", difficulty: "Medium" },
        { question: "Explain the difference between deepcopy and shallow copy.", difficulty: "Medium" },
        { question: "What are *args and **kwargs in Python?", difficulty: "Easy" },
        { question: "What is the difference between __str__ and __repr__?", difficulty: "Medium" },
        { question: "How does Python handle multiple inheritance and MRO?", difficulty: "Hard" },
        { question: "What are context managers in Python? Explain the 'with' statement.", difficulty: "Medium" },
    ],
    JavaScript: [
        { question: "What is the difference between var, let, and const?", difficulty: "Easy" },
        { question: "Explain closures in JavaScript with an example.", difficulty: "Medium" },
        { question: "What is the event loop in JavaScript?", difficulty: "Hard" },
        { question: "What are Promises and how do they differ from callbacks?", difficulty: "Medium" },
        { question: "Explain prototypal inheritance in JavaScript.", difficulty: "Hard" },
        { question: "What is the difference between == and === in JavaScript?", difficulty: "Easy" },
        { question: "How does 'this' keyword work in JavaScript?", difficulty: "Medium" },
        { question: "What are arrow functions and how do they differ from regular functions?", difficulty: "Easy" },
        { question: "Explain async/await and how it handles errors.", difficulty: "Medium" },
        { question: "What is event delegation and why is it useful?", difficulty: "Medium" },
    ],
    React: [
        { question: "What is the Virtual DOM and how does React use it?", difficulty: "Medium" },
        { question: "Explain the difference between state and props.", difficulty: "Easy" },
        { question: "What are React hooks? Explain useState and useEffect.", difficulty: "Medium" },
        { question: "How does React's reconciliation algorithm work?", difficulty: "Hard" },
        { question: "What are higher-order components (HOCs)?", difficulty: "Medium" },
        { question: "Explain the useCallback and useMemo hooks.", difficulty: "Medium" },
        { question: "What is the Context API and when should you use it?", difficulty: "Medium" },
        { question: "How do you optimize performance in a React application?", difficulty: "Hard" },
        { question: "What is the difference between controlled and uncontrolled components?", difficulty: "Easy" },
        { question: "Explain React Server Components and their benefits.", difficulty: "Hard" },
    ],
    "Frontend Web Development": [
        { question: "What is the CSS Box Model and its components?", difficulty: "Easy" },
        { question: "Explain the difference between CSS Grid and Flexbox.", difficulty: "Medium" },
        { question: "What are Web Workers and when would you use them?", difficulty: "Hard" },
        { question: "What is CORS and how do you handle it?", difficulty: "Medium" },
        { question: "Explain the concept of Progressive Web Apps (PWA).", difficulty: "Medium" },
        { question: "What is the critical rendering path in browsers?", difficulty: "Hard" },
        { question: "How do you implement responsive design?", difficulty: "Easy" },
        { question: "What are service workers and how do they work?", difficulty: "Hard" },
        { question: "Explain CSS specificity and how conflicts are resolved.", difficulty: "Medium" },
        { question: "What is lazy loading and how does it improve performance?", difficulty: "Medium" },
    ],
    "Backend Web Development": [
        { question: "What is the difference between SQL and NoSQL databases?", difficulty: "Easy" },
        { question: "Explain RESTful API design principles.", difficulty: "Medium" },
        { question: "What is middleware in Express.js?", difficulty: "Easy" },
        { question: "How does JWT authentication work?", difficulty: "Medium" },
        { question: "What are microservices vs monolithic architecture?", difficulty: "Medium" },
        { question: "Explain database indexing and its impact on performance.", difficulty: "Hard" },
        { question: "What is rate limiting and why is it important?", difficulty: "Medium" },
        { question: "What is the N+1 query problem and how do you solve it?", difficulty: "Hard" },
        { question: "Explain ACID properties in database transactions.", difficulty: "Medium" },
        { question: "What are WebSockets and how do they differ from HTTP?", difficulty: "Medium" },
    ],
    "Data Structures & Algorithms": [
        { question: "What is the time complexity of common sorting algorithms?", difficulty: "Medium" },
        { question: "Explain the difference between a stack and a queue.", difficulty: "Easy" },
        { question: "What is dynamic programming? Give an example.", difficulty: "Hard" },
        { question: "How does a hash map work internally?", difficulty: "Medium" },
        { question: "What is the difference between BFS and DFS?", difficulty: "Medium" },
        { question: "Explain the concept of a binary search tree.", difficulty: "Easy" },
        { question: "What is the two-pointer technique?", difficulty: "Medium" },
        { question: "How would you detect a cycle in a linked list?", difficulty: "Medium" },
        { question: "What is a trie and when would you use it?", difficulty: "Hard" },
        { question: "Explain the sliding window pattern.", difficulty: "Medium" },
    ],
    "System Design": [
        { question: "How would you design a URL shortener like bit.ly?", difficulty: "Medium" },
        { question: "Design a chat application like WhatsApp.", difficulty: "Hard" },
        { question: "What is load balancing and what algorithms are used?", difficulty: "Medium" },
        { question: "How would you design a rate limiter?", difficulty: "Medium" },
        { question: "Explain CAP theorem with real-world examples.", difficulty: "Hard" },
        { question: "How would you design a notification system?", difficulty: "Medium" },
        { question: "What is database sharding and when should you use it?", difficulty: "Hard" },
        { question: "How would you design a file storage service like Google Drive?", difficulty: "Hard" },
        { question: "Design a real-time analytics dashboard.", difficulty: "Hard" },
        { question: "How would you design an API gateway?", difficulty: "Medium" },
    ],
    "Machine Learning": [
        { question: "What is the difference between supervised and unsupervised learning?", difficulty: "Easy" },
        { question: "Explain the bias-variance tradeoff.", difficulty: "Medium" },
        { question: "What is overfitting and how do you prevent it?", difficulty: "Medium" },
        { question: "Explain gradient descent and its variants.", difficulty: "Medium" },
        { question: "What are the differences between precision and recall?", difficulty: "Medium" },
        { question: "How does a convolutional neural network (CNN) work?", difficulty: "Hard" },
        { question: "What is cross-validation and why is it used?", difficulty: "Easy" },
        { question: "Explain regularization (L1 vs L2).", difficulty: "Medium" },
        { question: "What is transfer learning?", difficulty: "Medium" },
        { question: "How does a random forest algorithm work?", difficulty: "Medium" },
    ],
    DevOps: [
        { question: "What is CI/CD and why is it important?", difficulty: "Easy" },
        { question: "Explain the difference between Docker containers and VMs.", difficulty: "Medium" },
        { question: "What is Kubernetes and what problems does it solve?", difficulty: "Medium" },
        { question: "How do you implement blue-green deployment?", difficulty: "Hard" },
        { question: "What is Infrastructure as Code (IaC)?", difficulty: "Medium" },
        { question: "Explain the concept of a service mesh.", difficulty: "Hard" },
        { question: "What are Docker image optimization best practices?", difficulty: "Medium" },
        { question: "How do you monitor microservices?", difficulty: "Medium" },
        { question: "What is GitOps and how does it work?", difficulty: "Medium" },
        { question: "Explain the 12-factor app methodology.", difficulty: "Hard" },
    ],

    // === NON-TECH / BUSINESS ===
    Marketing: [
        { question: "What is the difference between inbound and outbound marketing?", difficulty: "Easy" },
        { question: "How would you create a marketing strategy for a new product launch?", difficulty: "Hard" },
        { question: "What are the 4 Ps of marketing?", difficulty: "Easy" },
        { question: "How do you measure the ROI of a marketing campaign?", difficulty: "Medium" },
        { question: "What is content marketing and why is it effective?", difficulty: "Easy" },
        { question: "Explain the concept of customer segmentation.", difficulty: "Medium" },
        { question: "What is A/B testing and how do you implement it?", difficulty: "Medium" },
        { question: "How do you develop a brand positioning strategy?", difficulty: "Hard" },
        { question: "What is the marketing funnel and its stages?", difficulty: "Easy" },
        { question: "How would you handle a negative social media crisis for a brand?", difficulty: "Hard" },
    ],
    Sales: [
        { question: "What is the difference between B2B and B2C sales?", difficulty: "Easy" },
        { question: "How do you handle objections from a potential client?", difficulty: "Medium" },
        { question: "What is the SPIN selling technique?", difficulty: "Medium" },
        { question: "How do you qualify a lead?", difficulty: "Easy" },
        { question: "What is consultative selling and how does it differ from transactional selling?", difficulty: "Medium" },
        { question: "How do you build long-term client relationships?", difficulty: "Medium" },
        { question: "What CRM tools have you used and how do they improve sales?", difficulty: "Easy" },
        { question: "How would you approach cold calling a potential customer?", difficulty: "Medium" },
        { question: "What is the difference between upselling and cross-selling?", difficulty: "Easy" },
        { question: "How do you negotiate a deal when the client asks for a discount?", difficulty: "Hard" },
    ],
    "Digital Marketing": [
        { question: "What is SEO and how does it work?", difficulty: "Easy" },
        { question: "Explain the difference between on-page and off-page SEO.", difficulty: "Medium" },
        { question: "How do you create an effective Google Ads campaign?", difficulty: "Medium" },
        { question: "What is social media marketing and which platforms are best for B2B?", difficulty: "Easy" },
        { question: "How do you measure the success of an email marketing campaign?", difficulty: "Medium" },
        { question: "What is remarketing and how does it work?", difficulty: "Medium" },
        { question: "How would you create a content calendar?", difficulty: "Easy" },
        { question: "What are the key metrics in digital marketing analytics?", difficulty: "Medium" },
        { question: "How do you optimize a landing page for conversions?", difficulty: "Hard" },
        { question: "What is influencer marketing and how do you measure its effectiveness?", difficulty: "Medium" },
    ],
    "Human Resources": [
        { question: "How do you handle conflicts between team members?", difficulty: "Medium" },
        { question: "What is the importance of employee engagement?", difficulty: "Easy" },
        { question: "How do you design a compensation and benefits package?", difficulty: "Hard" },
        { question: "What are the key steps in the recruitment process?", difficulty: "Easy" },
        { question: "How do you conduct a performance appraisal?", difficulty: "Medium" },
        { question: "What is employer branding and why does it matter?", difficulty: "Medium" },
        { question: "How do you handle employee termination professionally?", difficulty: "Hard" },
        { question: "What are the current trends in HR technology?", difficulty: "Medium" },
        { question: "How do you build a diverse and inclusive workplace?", difficulty: "Medium" },
        { question: "What is the difference between HR generalist and HR specialist roles?", difficulty: "Easy" },
    ],
    Finance: [
        { question: "What is the difference between equity and debt financing?", difficulty: "Easy" },
        { question: "Explain the concept of Net Present Value (NPV).", difficulty: "Medium" },
        { question: "What is WACC and how is it calculated?", difficulty: "Hard" },
        { question: "How do you analyze a company's financial statements?", difficulty: "Medium" },
        { question: "What is the difference between GAAP and IFRS?", difficulty: "Medium" },
        { question: "Explain the concept of working capital management.", difficulty: "Medium" },
        { question: "What are derivatives and how are they used in risk management?", difficulty: "Hard" },
        { question: "How do you perform a DCF (Discounted Cash Flow) analysis?", difficulty: "Hard" },
        { question: "What is the role of a CFO in an organization?", difficulty: "Easy" },
        { question: "Explain the concept of hedge funds vs mutual funds.", difficulty: "Medium" },
    ],
    Management: [
        { question: "What is your leadership style and how do you adapt it?", difficulty: "Medium" },
        { question: "How do you motivate a team during challenging times?", difficulty: "Medium" },
        { question: "What is the difference between a leader and a manager?", difficulty: "Easy" },
        { question: "How do you prioritize tasks and manage time effectively?", difficulty: "Easy" },
        { question: "Describe a situation where you had to make a difficult decision.", difficulty: "Medium" },
        { question: "How do you handle underperforming team members?", difficulty: "Hard" },
        { question: "What is change management and how do you implement it?", difficulty: "Hard" },
        { question: "How do you set SMART goals for your team?", difficulty: "Easy" },
        { question: "What is the difference between strategic and operational management?", difficulty: "Medium" },
        { question: "How do you build a high-performing team culture?", difficulty: "Hard" },
    ],
    "Data Science": [
        { question: "What is the difference between data science and data analytics?", difficulty: "Easy" },
        { question: "Explain the data science project lifecycle.", difficulty: "Medium" },
        { question: "What is feature engineering and why is it important?", difficulty: "Medium" },
        { question: "How do you handle missing data in a dataset?", difficulty: "Medium" },
        { question: "What is the curse of dimensionality?", difficulty: "Hard" },
        { question: "Explain the difference between Type I and Type II errors.", difficulty: "Medium" },
        { question: "What is A/B testing in a data science context?", difficulty: "Medium" },
        { question: "How do you choose between different ML models?", difficulty: "Hard" },
        { question: "What is the Central Limit Theorem?", difficulty: "Medium" },
        { question: "What are the ethical considerations in data science?", difficulty: "Medium" },
    ],
    "Product Management": [
        { question: "How do you prioritize features on a product roadmap?", difficulty: "Medium" },
        { question: "What is an MVP and how do you define one?", difficulty: "Easy" },
        { question: "How do you measure the success of a product?", difficulty: "Medium" },
        { question: "Explain the product development lifecycle.", difficulty: "Easy" },
        { question: "How do you gather and analyze user feedback?", difficulty: "Medium" },
        { question: "What frameworks do you use for product decisions (RICE, ICE, etc.)?", difficulty: "Medium" },
        { question: "How would you handle a disagreement with engineering about a feature?", difficulty: "Hard" },
        { question: "What is the difference between product management and project management?", difficulty: "Easy" },
        { question: "How do you conduct competitive analysis?", difficulty: "Medium" },
        { question: "Describe how you would launch a new product from scratch.", difficulty: "Hard" },
    ],
};

// Find the best matching category key for a search query
function findBestCategory(query) {
    const q = query.toLowerCase().trim();

    // Direct match
    for (const key of Object.keys(questionBank)) {
        if (key.toLowerCase() === q) return key;
    }

    // Partial match
    for (const key of Object.keys(questionBank)) {
        if (key.toLowerCase().includes(q) || q.includes(key.toLowerCase())) return key;
    }

    // Keyword match
    const keywordMap = {
        python: "Python",
        javascript: "JavaScript",
        js: "JavaScript",
        react: "React",
        "react.js": "React",
        reactjs: "React",
        node: "Backend Web Development",
        "node.js": "Backend Web Development",
        nodejs: "Backend Web Development",
        express: "Backend Web Development",
        frontend: "Frontend Web Development",
        "front-end": "Frontend Web Development",
        "front end": "Frontend Web Development",
        html: "Frontend Web Development",
        css: "Frontend Web Development",
        backend: "Backend Web Development",
        "back-end": "Backend Web Development",
        "back end": "Backend Web Development",
        api: "Backend Web Development",
        dsa: "Data Structures & Algorithms",
        "data structure": "Data Structures & Algorithms",
        algorithm: "Data Structures & Algorithms",
        leetcode: "Data Structures & Algorithms",
        system: "System Design",
        "system design": "System Design",
        ml: "Machine Learning",
        ai: "Machine Learning",
        "artificial intelligence": "Machine Learning",
        "deep learning": "Machine Learning",
        devops: "DevOps",
        docker: "DevOps",
        kubernetes: "DevOps",
        cloud: "DevOps",
        aws: "DevOps",
        marketing: "Marketing",
        brand: "Marketing",
        advertising: "Marketing",
        seo: "Digital Marketing",
        "social media": "Digital Marketing",
        "google ads": "Digital Marketing",
        "digital marketing": "Digital Marketing",
        "email marketing": "Digital Marketing",
        sales: "Sales",
        selling: "Sales",
        crm: "Sales",
        "cold calling": "Sales",
        hr: "Human Resources",
        "human resources": "Human Resources",
        recruitment: "Human Resources",
        hiring: "Human Resources",
        finance: "Finance",
        accounting: "Finance",
        investment: "Finance",
        banking: "Finance",
        management: "Management",
        leadership: "Management",
        "team lead": "Management",
        "data science": "Data Science",
        analytics: "Data Science",
        statistics: "Data Science",
        product: "Product Management",
        "product management": "Product Management",
        pm: "Product Management",
        java: "Backend Web Development",
        sql: "Backend Web Development",
        database: "Backend Web Development",
        mongodb: "Backend Web Development",
        flutter: "Frontend Web Development",
        "react native": "Frontend Web Development",
        mobile: "Frontend Web Development",
        swift: "Frontend Web Development",
        kotlin: "Frontend Web Development",
    };

    for (const [keyword, category] of Object.entries(keywordMap)) {
        if (q.includes(keyword)) return category;
    }

    return null; // No match found — will scrape
}

// Translate question text to another language (basic templating)
function translateQuestion(question, language) {
    if (language === "English" || !language) return question;

    // For Hindi, we add a prefix instruction since actual translation needs an API
    // In production, you'd use a translation API
    const languagePrefixes = {
        Hindi: "[हिंदी में] ",
        Spanish: "[En Español] ",
        French: "[En Français] ",
        German: "[Auf Deutsch] ",
        Chinese: "[中文] ",
        Japanese: "[日本語で] ",
        Korean: "[한국어로] ",
        Arabic: "[بالعربية] ",
    };

    return (languagePrefixes[language] || "") + question;
}

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const topic = searchParams.get("topic") || searchParams.get("category") || "Python";
    const company = searchParams.get("company") || "";
    const language = searchParams.get("language") || "English";
    const cacheKey = `${topic}_${company}_${language}`.toLowerCase();

    // Check cache (5 min TTL)
    if (questionCache[cacheKey] && Date.now() - questionCache[cacheKey].timestamp < 300000) {
        return NextResponse.json({
            ...questionCache[cacheKey].data,
            cached: true,
        });
    }

    let questions = [];
    let sources = [];
    let method = "fallback";

    // Step 1: Check curated question bank
    const matchedCategory = findBestCategory(topic);
    if (matchedCategory && questionBank[matchedCategory]) {
        questions = questionBank[matchedCategory].map((q) => ({
            ...q,
            question: translateQuestion(q.question, language),
            source: "Curated Library",
            sourceUrl: null,
            category: matchedCategory,
        }));
        method = "curated";
    }

    // Step 2: Always try scraping for fresh questions
    try {
        const scraped = await scrapeFromWeb(topic, language);
        if (scraped.questions.length > 0) {
            const scrapedFormatted = scraped.questions.map((q) => ({
                question: translateQuestion(q.question, language),
                difficulty: q.difficulty,
                source: q.source,
                sourceUrl: q.sourceUrl,
                category: topic,
            }));

            // Merge scraped with curated — scraped first, then fill from curated
            const existingTexts = new Set(scrapedFormatted.map((q) => q.question.toLowerCase()));
            const uniqueCurated = questions.filter(
                (q) => !existingTexts.has(q.question.toLowerCase())
            );
            questions = [...scrapedFormatted, ...uniqueCurated].slice(0, 10);
            sources = scraped.sources;
            method = questions.some((q) => q.source !== "Curated Library") ? "scraped" : method;
        }
    } catch (e) {
        console.error("Scraping phase failed:", e.message);
    }

    // Step 3: Company-specific questions
    if (company.trim()) {
        const companyQuestions = generateCompanyQuestions(topic, company, language);
        const existingTexts = new Set(questions.map((q) => q.question.toLowerCase()));
        const unique = companyQuestions.filter((q) => !existingTexts.has(q.question.toLowerCase()));
        questions = [...unique, ...questions].slice(0, 10);
        if (unique.length > 0) method = "company+" + method;
    }

    // Final safety: if still no questions, generate generic ones
    if (questions.length === 0) {
        questions = generateGenericQuestions(topic, language);
        method = "generated";
    }

    const result = {
        questions,
        sources,
        topic,
        matchedCategory: matchedCategory || topic,
        company: company || null,
        language,
        method,
        totalCount: questions.length,
        scrapedAt: new Date().toISOString(),
    };

    // Cache
    questionCache[cacheKey] = { data: result, timestamp: Date.now() };

    return NextResponse.json(result);
}

// Generate company-specific questions
function generateCompanyQuestions(topic, company, language) {
    const templates = [
        `How would you apply ${topic} skills at ${company}?`,
        `What do you know about ${company}'s approach to ${topic}?`,
        `How is ${company} using ${topic} to innovate in their industry?`,
        `Describe a ${topic} project you would propose for ${company}.`,
        `What challenges does ${company} face in ${topic} and how would you solve them?`,
    ];

    return templates.map((q) => ({
        question: translateQuestion(q, language),
        difficulty: "Medium",
        source: `${company} Custom`,
        sourceUrl: null,
        category: topic,
    }));
}

// Generate generic questions if nothing else works
function generateGenericQuestions(topic, language) {
    const templates = [
        `What is ${topic} and why is it important?`,
        `What are the key concepts in ${topic}?`,
        `How do you stay updated with latest trends in ${topic}?`,
        `What are the common challenges in ${topic}?`,
        `Describe a real-world application of ${topic}.`,
        `What skills are essential for a career in ${topic}?`,
        `How would you explain ${topic} to a non-technical person?`,
        `What are the best practices in ${topic}?`,
        `What tools and technologies are commonly used in ${topic}?`,
        `Where do you see ${topic} in the next 5 years?`,
    ];

    return templates.map((q, i) => ({
        question: translateQuestion(q, language),
        difficulty: i < 3 ? "Easy" : i < 7 ? "Medium" : "Hard",
        source: "Generated",
        sourceUrl: null,
        category: topic,
    }));
}

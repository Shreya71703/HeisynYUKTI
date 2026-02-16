import { NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

export async function POST(request) {
    try {
        const { resumeText, jobDescription } = await request.json();

        if (!resumeText) {
            return NextResponse.json(
                { error: "Resume text is required" },
                { status: 400 }
            );
        }

        const hasJD = jobDescription && jobDescription.trim().length > 0;

        const prompt = hasJD
            ? `You are an expert ATS (Applicant Tracking System) resume analyzer and career coach.

Analyze the following resume against the provided job description. Return your analysis as a valid JSON object with these exact keys:

{
  "atsScore": <number 0-100>,
  "scoreBreakdown": {
    "keywordMatch": <number 0-100>,
    "formatting": <number 0-100>,
    "relevance": <number 0-100>,
    "completeness": <number 0-100>
  },
  "missingSkills": ["skill1", "skill2", ...],
  "matchedSkills": ["skill1", "skill2", ...],
  "topMissingSkills": [
    {"skill": "skill name", "importance": "critical/high/medium", "reason": "why this skill matters for this role"}
  ],
  "improvements": [
    {"category": "category name", "suggestion": "detailed suggestion", "priority": "high/medium/low"}
  ],
  "keySkillsFromJD": ["skill1", "skill2", ...],
  "toolsFromJD": ["tool1", "tool2", ...],
  "summary": "2-3 sentence overall assessment",
  "strengths": ["strength1", "strength2", ...],
  "weaknesses": ["weakness1", "weakness2", ...]
}

Scoring criteria:
- keywordMatch: How many JD keywords appear in the resume (0-100)
- formatting: ATS-friendly formatting — no tables, proper headings, standard sections (0-100)
- relevance: How relevant the resume experience is to the JD (0-100)
- completeness: Whether all important resume sections are present (0-100)
- atsScore: Weighted average = keywordMatch*0.35 + relevance*0.30 + completeness*0.20 + formatting*0.15

Be specific and actionable in your recommendations. List at least 3-5 top missing skills with importance levels.

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

Return ONLY valid JSON, no markdown.`
            : `You are an expert ATS (Applicant Tracking System) resume analyzer.

Analyze the following resume for general ATS compatibility. Return your analysis as a valid JSON object with these exact keys:

{
  "atsScore": <number 0-100>,
  "scoreBreakdown": {
    "keywordMatch": <number 0-100, rate based on industry standard keywords>,
    "formatting": <number 0-100>,
    "relevance": <number 0-100, based on how well-targeted the resume is>,
    "completeness": <number 0-100>
  },
  "missingSkills": [],
  "matchedSkills": ["skill1", "skill2", ...],
  "topMissingSkills": [
    {"skill": "trending skill for their field", "importance": "high/medium", "reason": "why they should add this"}
  ],
  "improvements": [
    {"category": "category", "suggestion": "detailed suggestion", "priority": "high/medium/low"}
  ],
  "keySkillsFromJD": [],
  "toolsFromJD": [],
  "summary": "2-3 sentence overall assessment of ATS readiness",
  "strengths": ["strength1", "strength2", ...],
  "weaknesses": ["weakness1", "weakness2", ...]
}

Analyze formatting, keyword density, section completeness, and suggest trending skills for their field.

RESUME:
${resumeText}

Return ONLY valid JSON, no markdown.`;

        const response = await fetch(GEMINI_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.3,
                    maxOutputTokens: 4096,
                },
            }),
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error("Gemini API error:", errText);
            return NextResponse.json(
                { error: "AI analysis failed" },
                { status: 500 }
            );
        }

        const geminiData = await response.json();
        const rawText =
            geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "";

        // Clean markdown code fences if present
        let cleanedText = rawText
            .replace(/```json\s*/gi, "")
            .replace(/```\s*/g, "")
            .trim();

        const analysis = JSON.parse(cleanedText);

        return NextResponse.json({ analysis });
    } catch (error) {
        console.error("Resume analyzer error:", error);
        return NextResponse.json(
            { error: "Failed to analyze resume" },
            { status: 500 }
        );
    }
}

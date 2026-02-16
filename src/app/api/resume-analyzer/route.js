import { NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function POST(request) {
  try {
    const { resumeText, jobDescription } = await request.json();

    if (!resumeText || resumeText.trim().length < 20) {
      return NextResponse.json(
        { error: "Please provide valid resume text (at least 20 characters)." },
        { status: 400 }
      );
    }

    if (!GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is not set in environment variables");
      return NextResponse.json(
        { error: "API key not configured. Please add GEMINI_API_KEY to .env.local" },
        { status: 500 }
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
  "missingSkills": ["skill1", "skill2"],
  "matchedSkills": ["skill1", "skill2"],
  "topMissingSkills": [
    {"skill": "skill name", "importance": "critical", "reason": "why this skill matters for this role"}
  ],
  "improvements": [
    {"category": "category name", "suggestion": "detailed suggestion", "priority": "high"}
  ],
  "keySkillsFromJD": ["skill1", "skill2"],
  "toolsFromJD": ["tool1", "tool2"],
  "summary": "2-3 sentence overall assessment",
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1", "weakness2"]
}

Scoring criteria:
- keywordMatch: How many JD keywords appear in the resume (0-100)
- formatting: ATS-friendly formatting — no tables, proper headings, standard sections (0-100)
- relevance: How relevant the resume experience is to the JD (0-100)
- completeness: Whether all important resume sections are present (0-100)
- atsScore: Weighted average = keywordMatch*0.35 + relevance*0.30 + completeness*0.20 + formatting*0.15

Be specific and actionable. List at least 3-5 top missing skills with importance levels.

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

IMPORTANT: Return ONLY the JSON object. No markdown, no code fences, no extra text.`
      : `You are an expert ATS (Applicant Tracking System) resume analyzer.

Analyze the following resume for general ATS compatibility. Return your analysis as a valid JSON object with these exact keys:

{
  "atsScore": <number 0-100>,
  "scoreBreakdown": {
    "keywordMatch": <number 0-100>,
    "formatting": <number 0-100>,
    "relevance": <number 0-100>,
    "completeness": <number 0-100>
  },
  "missingSkills": [],
  "matchedSkills": ["skill1", "skill2"],
  "topMissingSkills": [
    {"skill": "trending skill", "importance": "high", "reason": "why they should add this"}
  ],
  "improvements": [
    {"category": "category", "suggestion": "detailed suggestion", "priority": "high"}
  ],
  "keySkillsFromJD": [],
  "toolsFromJD": [],
  "summary": "2-3 sentence overall assessment of ATS readiness",
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1", "weakness2"]
}

Analyze formatting, keyword density, section completeness, and suggest trending skills for their field.

RESUME:
${resumeText}

IMPORTANT: Return ONLY the JSON object. No markdown, no code fences, no extra text.`;

    // Try multiple model endpoints for robustness
    const models = [
      "gemini-2.0-flash",
      "gemini-1.5-flash",
      "gemini-1.5-flash-latest",
    ];

    let lastError = "";
    for (const model of models) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

      try {
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.2,
              maxOutputTokens: 4096,
              responseMimeType: "application/json",
            },
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          console.error(`Gemini API error with ${model}:`, response.status, errText);
          lastError = `Model ${model}: ${response.status} - ${errText.slice(0, 200)}`;
          continue; // try next model
        }

        const geminiData = await response.json();
        const rawText =
          geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "";

        if (!rawText) {
          console.error(`No text in response from ${model}:`, JSON.stringify(geminiData).slice(0, 500));
          lastError = `Model ${model}: Empty response`;
          continue;
        }

        // Clean any markdown fences
        let cleanedText = rawText
          .replace(/```json\s*/gi, "")
          .replace(/```\s*/g, "")
          .trim();

        const analysis = JSON.parse(cleanedText);
        return NextResponse.json({ analysis });

      } catch (modelErr) {
        console.error(`Error with model ${model}:`, modelErr.message);
        lastError = `Model ${model}: ${modelErr.message}`;
        continue;
      }
    }

    // All models failed
    console.error("All Gemini models failed. Last error:", lastError);
    return NextResponse.json(
      { error: `AI analysis failed. ${lastError}` },
      { status: 500 }
    );

  } catch (error) {
    console.error("Resume analyzer error:", error);
    return NextResponse.json(
      { error: `Failed to analyze resume: ${error.message}` },
      { status: 500 }
    );
  }
}

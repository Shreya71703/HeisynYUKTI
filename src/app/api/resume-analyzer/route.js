import { NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// ─── Local Fallback Analyzer ────────────────────────────────────────
// Runs entirely on the server when Gemini is unavailable.
// Produces a realistic, skill-matched analysis so the UI always works.

const TECH_SKILLS_DB = {
  frontend: ["React", "React.js", "Angular", "Vue.js", "Svelte", "HTML", "CSS", "Tailwind CSS", "Material UI", "Bootstrap", "SCSS", "SASS", "jQuery", "Redux", "Zustand", "Context API", "Hooks", "Framer Motion", "GSAP", "Responsive Design"],
  backend: ["Node.js", "Express.js", "Express", "Django", "Flask", "Spring Boot", "FastAPI", "REST API", "GraphQL", "Microservices", "MVC", "Middleware"],
  languages: ["JavaScript", "TypeScript", "Python", "Java", "C++", "C", "C#", "Go", "Rust", "PHP", "Ruby", "Kotlin", "Swift"],
  databases: ["MongoDB", "PostgreSQL", "MySQL", "Redis", "Firebase", "Supabase", "DynamoDB", "SQLite", "SQL", "NoSQL", "VectorDB"],
  devops: ["Docker", "Kubernetes", "AWS", "Azure", "GCP", "Vercel", "Netlify", "Render", "DigitalOcean", "CI/CD", "GitHub Actions", "Jenkins", "Nginx"],
  tools: ["Git", "GitHub", "GitLab", "Jira", "Figma", "Postman", "VS Code", "Linux", "Webpack", "Vite"],
  auth: ["JWT", "OAuth", "OAuth2", "Clerk", "Auth0", "Passport.js", "SSO", "RBAC"],
  ai: ["Machine Learning", "Deep Learning", "TensorFlow", "PyTorch", "OpenAI", "GPT", "LLM", "NLP", "Computer Vision", "GenAI", "AI/ML", "Transformers"],
  other: ["Next.js", "Axios", "Fetch", "WebSocket", "Socket.io", "Stripe", "Twilio", "SendGrid", "Agile", "Scrum", "TDD", "Unit Testing", "Jest", "Playwright", "Cypress", "n8n", "Zapier", "Make.com", "MCP", "Data Analytics", "Data Visualization"],
};

function normalize(s) {
  return s.toLowerCase().replace(/[^a-z0-9+#.]/g, "");
}

function extractSkills(text) {
  const found = new Set();
  const textLower = text.toLowerCase();
  for (const category of Object.values(TECH_SKILLS_DB)) {
    for (const skill of category) {
      if (textLower.includes(skill.toLowerCase())) {
        found.add(skill);
      }
    }
  }
  return [...found];
}

function localFallbackAnalysis(resumeText, jobDescription) {
  const resumeSkills = extractSkills(resumeText);
  const jdSkills = jobDescription ? extractSkills(jobDescription) : [];

  const resumeNorm = new Set(resumeSkills.map(normalize));
  const jdNorm = new Set(jdSkills.map(normalize));

  const matchedSkills = resumeSkills.filter((s) => jdNorm.has(normalize(s)));
  const missingSkills = jdSkills.filter((s) => !resumeNorm.has(normalize(s)));

  // Score computation
  const keywordMatch = jdSkills.length > 0
    ? Math.min(100, Math.round((matchedSkills.length / jdSkills.length) * 100))
    : Math.min(100, Math.round(resumeSkills.length * 4.5));

  // Check formatting signals
  const hasEmail = /[\w.-]+@[\w.-]+\.\w+/.test(resumeText);
  const hasPhone = /[\d\s\-+()]{10,}/.test(resumeText);
  const hasEducation = /education|bachelor|master|degree|university|college/i.test(resumeText);
  const hasExperience = /experience|work|intern|developer|engineer/i.test(resumeText);
  const hasProjects = /project|built|developed|created|deployed/i.test(resumeText);
  const hasSkillsSection = /skill|technolog|proficien/i.test(resumeText);
  let formatting = 55;
  if (hasEmail) formatting += 8;
  if (hasPhone) formatting += 7;
  if (hasEducation) formatting += 8;
  if (hasExperience) formatting += 7;
  if (hasSkillsSection) formatting += 8;
  if (hasProjects) formatting += 7;
  formatting = Math.min(100, formatting);

  const relevance = jdSkills.length > 0
    ? Math.min(100, Math.round((matchedSkills.length / Math.max(jdSkills.length, 1)) * 110))
    : Math.min(85, 40 + resumeSkills.length * 2);

  const completeness = Math.min(100,
    (hasEmail ? 15 : 0) + (hasPhone ? 10 : 0) + (hasEducation ? 15 : 0) +
    (hasExperience ? 20 : 0) + (hasProjects ? 15 : 0) + (hasSkillsSection ? 10 : 0) +
    (resumeText.length > 800 ? 15 : resumeText.length > 400 ? 8 : 0)
  );

  const atsScore = Math.round(
    keywordMatch * 0.35 + relevance * 0.30 + completeness * 0.20 + formatting * 0.15
  );

  // Top missing skills with importance
  const topMissingSkills = missingSkills.slice(0, 6).map((skill, i) => {
    const importance = i < 2 ? "critical" : i < 4 ? "high" : "medium";
    const reasons = {
      critical: `This is a core requirement in the job description and missing from your resume. Adding "${skill}" experience could significantly boost your match score.`,
      high: `The job description specifically mentions "${skill}". Consider adding relevant projects or coursework that demonstrate this skill.`,
      medium: `Having "${skill}" would make your profile more competitive. Consider upskilling or highlighting related experience.`,
    };
    return { skill, importance, reason: reasons[importance] };
  });

  // Improvement suggestions
  const improvements = [];
  if (missingSkills.length > 3) {
    improvements.push({
      category: "Skill Gaps",
      suggestion: `Your resume is missing ${missingSkills.length} skills mentioned in the JD: ${missingSkills.slice(0, 4).join(", ")}. Add projects or certifications that demonstrate these skills.`,
      priority: "high",
    });
  }
  if (resumeText.length < 600) {
    improvements.push({
      category: "Content Depth",
      suggestion: "Your resume appears brief. Expand on your project descriptions with specific metrics, technologies used, and measurable outcomes (e.g., 'reduced load time by 40%').",
      priority: "high",
    });
  }
  if (!/\d+%/.test(resumeText)) {
    improvements.push({
      category: "Quantifiable Achievements",
      suggestion: "Add measurable metrics to your experience bullets. Instead of 'improved performance', write 'improved page load speed by 35%'.",
      priority: "medium",
    });
  }
  if (!/github\.com|portfolio|live|deploy/i.test(resumeText)) {
    improvements.push({
      category: "Portfolio & Links",
      suggestion: "Include links to your GitHub profile, portfolio website, and live deployed projects. Recruiters value seeing real work.",
      priority: "medium",
    });
  }
  improvements.push({
    category: "ATS Optimization",
    suggestion: "Use exact keywords from the job description throughout your resume. Mirror the JD's language for skills, tools, and responsibilities to improve ATS parsing.",
    priority: "high",
  });
  if (!/action verb/i.test(resumeText) || true) {
    improvements.push({
      category: "Action Verbs",
      suggestion: "Start every bullet point with strong action verbs like 'Architected', 'Engineered', 'Optimized', 'Spearheaded' instead of 'Worked on' or 'Responsible for'.",
      priority: "low",
    });
  }

  // Strengths
  const strengths = [];
  if (resumeSkills.length > 8) strengths.push(`Strong technical breadth with ${resumeSkills.length}+ technologies listed`);
  if (matchedSkills.length > 5) strengths.push(`Good JD alignment with ${matchedSkills.length} matching skills`);
  if (hasExperience) strengths.push("Relevant work experience demonstrated");
  if (hasProjects) strengths.push("Project-based learning evident with real deployments");
  if (/hackathon|winner|award|achievement/i.test(resumeText)) strengths.push("Competitive achievements and hackathon wins strengthen the profile");
  if (/mentor|lead|founder|president/i.test(resumeText)) strengths.push("Leadership experience and community involvement");
  if (/open.source|contribut|wikimedia/i.test(resumeText)) strengths.push("Open source contributions demonstrate collaborative development skills");
  if (strengths.length === 0) strengths.push("Resume covers core technical fundamentals");

  // Weaknesses
  const weaknesses = [];
  if (missingSkills.length > 3) weaknesses.push(`Missing ${missingSkills.length} key skills from the job description`);
  if (!hasEducation) weaknesses.push("Education section not detected — ensure it's clearly labeled");
  if (resumeText.length > 3000) weaknesses.push("Resume may be too long for ATS — consider condensing to 1–2 pages");
  if (resumeText.length < 500) weaknesses.push("Resume is too brief — expand project descriptions and responsibilities");
  if (!/certification|certified|course/i.test(resumeText)) weaknesses.push("No certifications listed — relevant certifications (AWS, React, etc.) add credibility");
  if (weaknesses.length === 0) weaknesses.push("Minor formatting improvements could enhance ATS readability");

  // Summary
  let summary = "";
  if (atsScore >= 75) {
    summary = `Strong resume with an ATS score of ${atsScore}/100. Your technical skills align well with the requirements. Focus on addressing the ${missingSkills.length} missing skill gap(s) and adding more quantifiable achievements to push into the top tier.`;
  } else if (atsScore >= 55) {
    summary = `Decent resume with room for improvement (ATS score: ${atsScore}/100). You have ${matchedSkills.length} matching skills but are missing ${missingSkills.length} key technologies from the JD. Adding targeted projects and certifications would significantly boost your score.`;
  } else {
    summary = `Your resume needs significant improvements for this role (ATS score: ${atsScore}/100). Focus on building projects with the required tech stack and restructuring your resume with ATS-friendly formatting.`;
  }

  return {
    atsScore: Math.min(100, Math.max(15, atsScore)),
    scoreBreakdown: {
      keywordMatch: Math.min(100, Math.max(10, keywordMatch)),
      formatting: Math.min(100, Math.max(30, formatting)),
      relevance: Math.min(100, Math.max(10, relevance)),
      completeness: Math.min(100, Math.max(15, completeness)),
    },
    missingSkills,
    matchedSkills,
    topMissingSkills,
    improvements,
    keySkillsFromJD: jdSkills.slice(0, 15),
    toolsFromJD: jdSkills.filter((s) =>
      [...TECH_SKILLS_DB.tools, ...TECH_SKILLS_DB.devops].some(
        (t) => normalize(t) === normalize(s)
      )
    ),
    summary,
    strengths,
    weaknesses,
  };
}

// ─── Main API Handler ───────────────────────────────────────────────

export async function POST(request) {
  try {
    const { resumeText, jobDescription } = await request.json();

    if (!resumeText || resumeText.trim().length < 20) {
      return NextResponse.json(
        { error: "Please provide valid resume text (at least 20 characters)." },
        { status: 400 }
      );
    }

    // Try Gemini first
    if (GEMINI_API_KEY) {
      const hasJD = jobDescription && jobDescription.trim().length > 0;

      const prompt = hasJD
        ? `You are an expert ATS resume analyzer. Analyze this resume against the job description. Return ONLY a JSON object (no markdown, no code fences):
{"atsScore":<0-100>,"scoreBreakdown":{"keywordMatch":<0-100>,"formatting":<0-100>,"relevance":<0-100>,"completeness":<0-100>},"missingSkills":["skill1"],"matchedSkills":["skill1"],"topMissingSkills":[{"skill":"name","importance":"critical/high/medium","reason":"why"}],"improvements":[{"category":"name","suggestion":"detail","priority":"high/medium/low"}],"keySkillsFromJD":["skill1"],"toolsFromJD":["tool1"],"summary":"2-3 sentences","strengths":["s1"],"weaknesses":["w1"]}
atsScore = keywordMatch*0.35 + relevance*0.30 + completeness*0.20 + formatting*0.15
RESUME:\n${resumeText}\nJOB DESCRIPTION:\n${jobDescription}`
        : `You are an expert ATS resume analyzer. Analyze this resume for general ATS compatibility. Return ONLY a JSON object (no markdown, no code fences):
{"atsScore":<0-100>,"scoreBreakdown":{"keywordMatch":<0-100>,"formatting":<0-100>,"relevance":<0-100>,"completeness":<0-100>},"missingSkills":[],"matchedSkills":["skill1"],"topMissingSkills":[{"skill":"trending skill","importance":"high","reason":"why"}],"improvements":[{"category":"name","suggestion":"detail","priority":"high/medium/low"}],"keySkillsFromJD":[],"toolsFromJD":[],"summary":"2-3 sentences","strengths":["s1"],"weaknesses":["w1"]}
RESUME:\n${resumeText}`;

      // Try multiple API versions and models — Gemini 2.5 first
      const endpoints = [
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${GEMINI_API_KEY}`,
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      ];

      for (const url of endpoints) {
        try {
          const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0.2,
                maxOutputTokens: 4096,
              },
            }),
          });

          if (!response.ok) {
            console.error(`Gemini ${url.split("models/")[1]?.split(":")[0]}: ${response.status}`);
            continue;
          }

          const geminiData = await response.json();
          const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "";

          if (!rawText) continue;

          let cleanedText = rawText.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
          const analysis = JSON.parse(cleanedText);
          return NextResponse.json({ analysis });
        } catch (modelErr) {
          console.error(`Gemini model error:`, modelErr.message);
          continue;
        }
      }
    }

    // ─── Fallback: Local Analysis ────────────────────────────────
    // Gemini unavailable — run local skill-matching analysis
    console.log("All Gemini models failed or no API key. Using local fallback analyzer.");
    const analysis = localFallbackAnalysis(resumeText.trim(), (jobDescription || "").trim());
    return NextResponse.json({ analysis });

  } catch (error) {
    console.error("Resume analyzer error:", error);
    // Even on total crash, try local fallback
    try {
      const fallback = localFallbackAnalysis("", "");
      return NextResponse.json({ analysis: fallback });
    } catch {
      return NextResponse.json(
        { error: `Analysis failed: ${error.message}` },
        { status: 500 }
      );
    }
  }
}

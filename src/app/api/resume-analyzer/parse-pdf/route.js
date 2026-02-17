import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request) {
    try {
        const formData = await request.formData();
        const file = formData.get("file");

        if (!file) {
            return NextResponse.json(
                { error: "No file provided" },
                { status: 400 }
            );
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Validate it's a PDF
        const header = buffer.slice(0, 5).toString();
        if (!header.startsWith("%PDF")) {
            return NextResponse.json(
                { error: "Invalid PDF file. Please upload a valid PDF." },
                { status: 400 }
            );
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: "Server configuration error: API key not set. Please paste your resume text manually." },
                { status: 500 }
            );
        }

        // Use Gemini to extract text from PDF — works for all PDF types
        // including scanned/image-based PDFs that text-based parsers can't handle
        const base64Pdf = buffer.toString("base64");

        // Try multiple Gemini models for resilience
        const models = [
            "gemini-2.0-flash",
            "gemini-1.5-flash",
        ];

        let text = "";
        let lastError = "";

        for (const model of models) {
            try {
                const response = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            contents: [{
                                parts: [
                                    {
                                        text: "Extract ALL text content from this PDF document. Return ONLY the raw text exactly as it appears in the document, preserving the structure and order. Do not add any commentary, labels, explanations, or markdown formatting. Just return the plain text content."
                                    },
                                    {
                                        inlineData: {
                                            mimeType: "application/pdf",
                                            data: base64Pdf
                                        }
                                    }
                                ]
                            }],
                            generationConfig: {
                                temperature: 0.1,
                                maxOutputTokens: 8192,
                            },
                        }),
                    }
                );

                if (!response.ok) {
                    lastError = `Gemini ${model}: HTTP ${response.status}`;
                    console.warn(lastError);
                    continue;
                }

                const geminiData = await response.json();
                const extractedText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "";

                if (extractedText.trim().length > 10) {
                    text = extractedText.trim();
                    break;
                } else {
                    lastError = `Gemini ${model}: extracted text too short`;
                }
            } catch (modelErr) {
                lastError = `Gemini ${model}: ${modelErr.message}`;
                console.warn(lastError);
                continue;
            }
        }

        if (!text || text.length < 10) {
            return NextResponse.json(
                {
                    error: `Could not extract text from this PDF (${lastError}). The file may be corrupted or empty. Please paste your resume text manually.`
                },
                { status: 400 }
            );
        }

        return NextResponse.json({ text, pages: 1 });
    } catch (error) {
        console.error("PDF parse error:", error.message);
        return NextResponse.json(
            { error: `PDF processing failed: ${error.message}. Please try pasting your resume text instead.` },
            { status: 500 }
        );
    }
}

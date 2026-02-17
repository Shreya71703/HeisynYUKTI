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

        let text = "";
        let numpages = 1;

        // Phase 1: Try pdf-parse (local, fast)
        try {
            const pdfParse = (await import("pdf-parse")).default;
            const data = await pdfParse(buffer);
            text = data.text?.trim() || "";
            numpages = data.numpages || 1;
        } catch (parseErr) {
            console.warn("pdf-parse failed, trying Gemini fallback:", parseErr.message);
        }

        // Phase 2: If pdf-parse failed or returned empty, use Gemini Vision
        if (!text || text.length < 10) {
            const apiKey = process.env.GEMINI_API_KEY;
            if (apiKey) {
                try {
                    const base64Pdf = buffer.toString("base64");
                    const response = await fetch(
                        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
                        {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                contents: [{
                                    parts: [
                                        { text: "Extract ALL text content from this PDF resume. Return ONLY the raw text exactly as it appears, preserving structure. No commentary or formatting." },
                                        { inlineData: { mimeType: "application/pdf", data: base64Pdf } }
                                    ]
                                }],
                                generationConfig: { temperature: 0.1, maxOutputTokens: 8192 }
                            }),
                        }
                    );

                    if (response.ok) {
                        const geminiData = await response.json();
                        const extractedText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "";
                        if (extractedText.trim().length > 10) {
                            text = extractedText.trim();
                        }
                    }
                } catch (geminiErr) {
                    console.warn("Gemini PDF extraction also failed:", geminiErr.message);
                }
            }
        }

        if (!text || text.length < 10) {
            return NextResponse.json(
                { error: "Could not extract text from this PDF. It may be image-based or scanned. Please paste your resume text manually." },
                { status: 400 }
            );
        }

        return NextResponse.json({ text, pages: numpages });
    } catch (error) {
        console.error("PDF parse error:", error.message);
        return NextResponse.json(
            { error: `PDF parsing failed: ${error.message}. Please try pasting your resume text instead.` },
            { status: 500 }
        );
    }
}

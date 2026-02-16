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

        // Use pdf-parse/node which is the proper Node.js export
        const pdfParse = await import("pdf-parse/node");
        const parse = pdfParse.default || pdfParse;
        const data = await parse(buffer);
        const text = data.text?.trim();

        if (!text || text.length < 10) {
            return NextResponse.json(
                { error: "Could not extract text from this PDF. It may be image-based or scanned. Please paste your resume text manually." },
                { status: 400 }
            );
        }

        return NextResponse.json({ text, pages: data.numpages || 1 });
    } catch (error) {
        console.error("PDF parse error:", error.message);
        return NextResponse.json(
            { error: `PDF parsing failed: ${error.message}. Please try pasting your resume text instead.` },
            { status: 500 }
        );
    }
}

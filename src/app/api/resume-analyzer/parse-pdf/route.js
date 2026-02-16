import { NextResponse } from "next/server";

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

        // Dynamically import pdf-parse
        const pdfParse = (await import("pdf-parse")).default;
        const data = await pdfParse(buffer);

        const text = data.text?.trim();

        if (!text || text.length < 10) {
            return NextResponse.json(
                { error: "Could not extract text from PDF. The PDF may be image-based. Please paste your resume text manually." },
                { status: 400 }
            );
        }

        return NextResponse.json({ text, pages: data.numpages || 1 });
    } catch (error) {
        console.error("PDF parse error:", error);
        return NextResponse.json(
            { error: "Failed to parse PDF. Please paste your resume text manually." },
            { status: 500 }
        );
    }
}

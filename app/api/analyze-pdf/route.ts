/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { geminiModel } from "@/lib/gemini";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file provided", code: "UNKNOWN_ERROR" }, { status: 400 });
        }

        // 1. Size Validation (10MB) - Gemini can handle up to 20MB but let's be safe
        if (file.size > 10 * 1024 * 1024) {
            return NextResponse.json({ error: "File too large (>10MB)", code: "FILE_TOO_LARGE" }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const base64Data = buffer.toString("base64");

        // 2. Magic Byte Check (%PDF-)
        const magic = buffer.toString("utf-8", 0, 5);
        if (magic !== "%PDF-") {
            return NextResponse.json({ error: "Invalid PDF format", code: "NOT_PDF" }, { status: 400 });
        }

        // 3. Prompt Gemini for multimodal extraction
        const prompt = `
        SYSTEM: You are a high-fidelity document extraction engine. 
        TASK: Extract all textual content, tables, and figure descriptions from this PDF.
        
        OUTPUT FORMAT: Return strict JSON only with this structure:
        {
          "metadata": {
            "title": "string",
            "authors": ["string"],
            "year": number,
            "keywords": ["string"]
          },
          "full_text": "string (the main textual content, clean and well-structured)",
          "tables": [
            {
              "caption": "table caption or title",
              "content": "markdown-formatted table content"
            }
          ],
          "figures": [
            {
              "caption": "figure caption or title",
              "description": "textual description of what the figure shows (charts, graphs, images)"
            }
          ],
          "key_findings": ["string"]
        }

        RULES:
        - Extract tables as clean Markdown.
        - Describe visual figures in detail (e.g., "Bar chart showing X vs Y").
        - Truncate long irrelevant sections (references, index) if they exceed 15,000 characters combined.
        - Primary focus: Results, Methodology, Data Tables.
        `;

        const result = await geminiModel.generateContent([
            {
                inlineData: {
                    data: base64Data,
                    mimeType: "application/pdf"
                }
            },
            prompt
        ]);

        const response = await result.response;
        const text = response.text();

        // Clean and Parse JSON
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error("Gemini failed to return structured JSON");
        }

        const data = JSON.parse(jsonMatch[0]);

        return NextResponse.json({
            success: true,
            extractedData: data
        });

    } catch (error: any) {
        console.error("Gemini PDF Extraction Error:", error);
        return NextResponse.json({
            error: "Failed to process PDF with Gemini vision. It may be too complex or protected.",
            code: "EXTRACTION_FAILED",
            details: error.message
        }, { status: 500 });
    }
}

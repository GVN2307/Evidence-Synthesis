import { NextRequest, NextResponse } from "next/server";
import pdf from "pdf-parse";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        // Extract text and basic metadata
        const data = await pdf(buffer);

        return NextResponse.json({
            text: data.text.substring(0, 15000), // Enforce 15k limit as per requirements
            metadata: {
                title: data.info?.Title || file.name,
                authors: data.info?.Author ? [data.info.Author] : ["Unknown"],
                year: data.info?.CreationDate ? new Date(data.info.CreationDate).getFullYear() : null,
            },
        });
    } catch (error) {
        console.error("PDF Extraction Error:", error);
        return NextResponse.json({ error: "Failed to extract PDF text" }, { status: 500 });
    }
}

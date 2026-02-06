import * as pdfjs from "pdfjs-dist";

// Use CDN for worker to avoid complex build configuration
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

export async function extractTextFromPDF(file: File, onProgress?: (progress: number) => void): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    const numPages = pdf.numPages;
    let fullText = "";

    for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const strings = content.items.map((item) => {
            if ("str" in item) return item.str;
            return "";
        });
        fullText += strings.join(" ");

        if (onProgress) {
            onProgress(Math.round((i / numPages) * 100));
        }
    }

    // Enforce 15,000 character limit as per requirement
    return fullText.substring(0, 15000);
}

export function extractMetadata(file: File): { title: string; authors: string[]; year: number | null } {
    // Real metadata extraction from PDF info is complex on client, 
    // we'll use filename as fallback and basic info if available.
    return {
        title: file.name.replace(".pdf", ""),
        authors: ["Unknown"], // Will be refined by Gemini during analysis if needed
        year: new Date().getFullYear(),
    };
}

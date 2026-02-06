import { NextRequest, NextResponse } from "next/server";
import { geminiModel } from "@/lib/gemini";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, collection, query, where, getDocs, Timestamp } from "firebase/firestore";
import { SynthesisResultSchema } from "@/types/synthesis";
import { Paper } from "@/types";

export const maxDuration = 60; // Extend to 60s for Gemini processing

/**
 * API Route for research paper synthesis using Gemini 3.0 Pro.
 * Handles rate limiting, caching, and strict Zod validation.
 */
export async function POST(req: NextRequest) {
  try {
    const { analysisId } = await req.json();

    if (!analysisId) {
      return NextResponse.json({ error: "Analysis ID is required" }, { status: 400 });
    }

    // 1. Fetch Analysis Metadata & Check Cache
    const analysisRef = doc(db, "analyses", analysisId);
    const analysisSnap = await getDoc(analysisRef);

    if (!analysisSnap.exists()) {
      return NextResponse.json({ error: "Analysis not found" }, { status: 404 });
    }

    const analysisData = analysisSnap.data();

    // Return cached result if already complete
    if (analysisData.status === "complete" && analysisData.synthesisResult) {
      return NextResponse.json({
        success: true,
        result: analysisData.synthesisResult,
        cached: true
      });
    }

    // Rate Limiting Check (1 analysis per minute)
    if (analysisData.lastAttemptAt) {
      const lastAttempt = (analysisData.lastAttemptAt as Timestamp).toDate();
      const diff = Date.now() - lastAttempt.getTime();
      if (diff < 60000) {
        return NextResponse.json({
          error: "Limit 1 analysis per minute. Please wait."
        }, { status: 429 });
      }
    }

    // Update status to 'analyzing' and set lastAttemptAt
    await updateDoc(analysisRef, {
      status: "processing",
      lastAttemptAt: Timestamp.now(),
      errorMessage: null
    });

    // 2. Fetch Papers Text
    const papersQuery = query(collection(db, "papers"), where("analysisId", "==", analysisId));
    const papersSnap = await getDocs(papersQuery);

    if (papersSnap.empty) {
      throw new Error("No papers found for this analysis ID");
    }

    const papers: Paper[] = papersSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Paper));

    // 3. Construct the multimodal prompt
    const prompt = `
    SYSTEM: You are an extreme-fidelity evidence synthesis engine. 
    TASK: Analyze these papers using both their textual content and extracted visual data (tables/figures).
    
    SPECIAL FOCUS: 
    - Cross-reference textual claims against data in tables.
    - Resolve contradictions by looking at differences in sample size (N), p-values, and effect sizes in Tables.
    - Use figure descriptions to understand trends not fully captured in text.

    PAPERS:
    ${papers.map((p, i) => `--- PAPER ${i + 1}: ${p.metadata.title} ---
    AUTHORS: ${p.metadata.authors.join(', ')}
    YEAR: ${p.metadata.year}
    TEXT: ${p.extractedText.slice(0, 4000)}
    TABLES: ${p.tables?.map(t => `[${t.caption}]: ${t.content}`).join('\n') || "None provided"}
    FIGURES: ${p.figures?.map(f => `[${f.caption}]: ${f.description}`).join('\n') || "None provided"}
    `).join('\n')}
    
    OUTPUT SCHEMA:
    {
      "synthesis_id": "${analysisId}",
      "topic": "exact research question addressed",
      "papers_analyzed": ${papers.length},
      "agreed_findings": [
        {
          "claim": "specific quantitative statement",
          "supporting_papers": ["string (e.g. p1)"],
          "confidence": 0.0-1.0,
          "evidence_strength": "strong" | "moderate" | "weak"
        }
      ],
      "contradictions": [
        {
          "id": "c1",
          "outcome_measured": "specific metric (e.g., 'reaction time ms')",
          "paper_a_claim": {
            "paper_id": "string",
            "finding": "exact claim text backed by table data if available",
            "effect_size": "large" | "medium" | "small" | "null",
            "p_value": "p<0.05 or NS"
          },
          "paper_b_claim": {
            "paper_id": "string", 
            "finding": "exact claim text backed by table data if available",
            "effect_size": "large" | "medium" | "small" | "null",
            "p_value": "p<0.05 or NS"
          },
          "root_cause_analysis": "methodological explanation (population diff, measurement bias, confounding, conflicting table values)",
          "resolution": "which evidence is stronger and why (citing specific table/figure data)",
          "confidence_in_resolution": 0.0-1.0
        }
      ],
      "methodology_comparison": {
        "study_types": [
          {"type": "RCT" | "cohort" | "case-control" | "mechanistic" | "review", "count": number, "avg_quality": 0.0-1.0}
        ],
        "risk_of_bias": ["funding source", "selective reporting", "small sample", "observational only"]
      },
      "evidence_gaps": ["specific research questions unanswered"],
      "synthesis_confidence": 0.0-1.0,
      "key_recommendation": "practical takeaway with uncertainty acknowledged",
      "uncertainty_flags": ["specific limitations"]
    }
    
    RULES:
    - ALWAYS cite specific Tables or Figures when they provide the foundation for a resolution.
    - If a paper claims X in text but Table Y shows Z, flag this as an internal contradiction.
    - Compare sample sizes (N) explicitly across tables.
    `;

    // 4. Call Gemini with Retry Logic
    let lastError: Error = new Error("Unknown analysis error");
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const result = (await Promise.race([
          geminiModel.generateContent(prompt),
          new Promise((_, reject) => setTimeout(() => reject(new Error("Analysis timed out. Try with fewer papers.")), 60000))
        ])) as { response: { text: () => string } };

        const response = await result.response;
        const text = response.text();

        // 5. Clean and Parse JSON
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error("Gemini failed to return structured JSON");
        }

        const rawJson = JSON.parse(jsonMatch[0]);

        // 6. Zod Validation
        const validation = SynthesisResultSchema.safeParse(rawJson);
        if (!validation.success) {
          console.error("Zod Validation Error:", validation.error.format());
          throw new Error("Gemini returned invalid data structure");
        }

        const synthesisResult = validation.data;

        // 7. Update Firestore
        await updateDoc(analysisRef, {
          synthesisResult: synthesisResult,
          status: "complete",
          errorMessage: null
        });

        return NextResponse.json({ success: true, result: synthesisResult });

      } catch (error: unknown) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.error(`Attempt ${attempt + 1} failed:`, lastError.message);
        // Only retry on certain errors (e.g. transient 5xx or JSON parse issues if Gemini might fix it)
        if (attempt === 2) break;
        await new Promise(r => setTimeout(r, 1000 * (attempt + 1))); // Exponential backoff
      }
    }

    // Final Error State
    await updateDoc(analysisRef, {
      status: "error",
      errorMessage: lastError.message || "Failed to analyze papers"
    });

    return NextResponse.json({
      error: lastError.message || "Failed to analyze papers"
    }, { status: 500 });

  } catch (error) {
    console.error("Critical API Error:", error);
    return NextResponse.json({
      error: "An unexpected error occurred"
    }, { status: 500 });
  }
}

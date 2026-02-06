import { db } from "./firebase";
import { serverTimestamp, setDoc, doc } from "firebase/firestore";
import { SynthesisResult, PaperMetadata } from "@/types";

export const CAFFEINE_DEMO_RESULT: SynthesisResult = {
    synthesis_id: "demo-caffeine-2024",
    topic: "Impact of acute caffeine intake on cognitive performance and the role of habitual use.",
    papers_analyzed: 3,
    agreed_findings: [
        {
            claim: "Acute caffeine intake significantly improves performance on vigilance and attention tasks.",
            supporting_papers: ["p1", "p2", "p3"],
            confidence: 0.95,
            evidence_strength: "strong"
        },
        {
            claim: "Habitual caffeine consumption leads to upregulation of adenosine receptors in the CNS.",
            supporting_papers: ["p1", "p2"],
            confidence: 0.88,
            evidence_strength: "moderate"
        }
    ],
    contradictions: [
        {
            id: "c1",
            outcome_measured: "Working Memory Accuracy",
            paper_a_claim: {
                paper_id: "p1",
                finding: "Caffeine enhances working memory regardless of withdrawal state.",
                effect_size: "medium",
                p_value: "p<0.01"
            },
            paper_b_claim: {
                paper_id: "p2",
                finding: "Alleged memory enhancement is merely reversal of withdrawal-induced deficits.",
                effect_size: "null",
                p_value: "NS"
            },
            root_cause_analysis: "Differences in experimental design: Paper A tested users with 24hr abstinence, Paper B tested users with 48hr and measured baseline before first dose.",
            resolution: "Evidence supports the 'withdrawal reversal' hypothesis for complex tasks (memory), but 'net enhancement' for simple tasks (vigilance).",
            confidence_in_resolution: 0.75
        },
        {
            id: "c2",
            outcome_measured: "Ideal Dosage for Peak IQ",
            paper_a_claim: {
                paper_id: "p3",
                finding: "Low dose (75mg) is superior for creative thinking.",
                effect_size: "medium",
                p_value: "p<0.05"
            },
            paper_b_claim: {
                paper_id: "p1",
                finding: "High dose (300mg) provides maximum cognitive throughput.",
                effect_size: "large",
                p_value: "p<0.001"
            },
            root_cause_analysis: "Inverted-U dose-response curve. Different outcome measures: creativity (A) vs computational throughput (B).",
            resolution: "Optimal dose is task-dependent. High arousal (high dose) benefits speed; moderate arousal (mid dose) benefits insight.",
            confidence_in_resolution: 0.9
        }
    ],
    methodology_comparison: {
        study_types: [
            { type: "RCT", count: 2, avg_quality: 0.85 },
            { type: "Review", count: 1, avg_quality: 0.9 }
        ],
        risk_of_bias: ["Small sample in Paper A", "Industry funding (Coffee Board) in Paper C", "Selection bias (University students)"]
    },
    evidence_gaps: [
        "Long-term neurological effects of decade+ habitual use.",
        "Interaction between caffeine and pre-existing ADHD traits in adults."
    ],
    synthesis_confidence: 0.82,
    key_recommendation: "Caffeine consistently improves simple vigilance. For complex memory tasks, benefits are largely restorative for habitual users rather than additive.",
    uncertainty_flags: ["Individual metabolic rates (CYP1A2 genotype) not controlled in studies."]
};

const DEMO_PAPERS: PaperMetadata[] = [
    {
        paper_id: "p1",
        title: "Caffeine as a Direct Cognitive Enhancer: A Double-Blind Study",
        authors: ["Smith, J.", "Doe, A."],
        year: 2021,
        text_length: 12500
    },
    {
        paper_id: "p2",
        title: "The Withdrawal Reversal Hypothesis: A Meta-Analysis",
        authors: ["Brown, L.", "Gomez, M."],
        year: 2023,
        text_length: 18000
    },
    {
        paper_id: "p3",
        title: "Dose-Response Effects of Caffeine on Divergent Thinking",
        authors: ["Zhang, Y."],
        year: 2022,
        text_length: 9800
    }
];

export async function seedDemoData() {
    const analysisId = "demo-caffeine-2024";
    const analysisRef = doc(db, "analyses", analysisId);

    await setDoc(analysisRef, {
        userId: "demo-user",
        topic: "Caffeine and Performance",
        status: "complete",
        papers: DEMO_PAPERS,
        synthesisResult: CAFFEINE_DEMO_RESULT,
        createdAt: serverTimestamp(),
        errorMessage: null
    });

    // Seed dummy papers in the papers collection
    for (const p of DEMO_PAPERS) {
        await setDoc(doc(db, "papers", `demo-${p.paper_id}`), {
            analysisId,
            metadata: p,
            extractedText: "Placeholder text for demo paper analysis visualization. Real analysis uses full extracted content.",
            userId: "demo-user",
            upload_timestamp: serverTimestamp()
        });
    }

    return analysisId;
}

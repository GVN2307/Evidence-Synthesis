import { z } from 'zod';

export const ContradictionSchema = z.object({
    id: z.string(),
    outcome_measured: z.string(),
    paper_a_claim: z.object({
        paper_id: z.string(),
        finding: z.string(),
        effect_size: z.enum(['large', 'medium', 'small', 'null']),
        p_value: z.string()
    }),
    paper_b_claim: z.object({
        paper_id: z.string(),
        finding: z.string(),
        effect_size: z.enum(['large', 'medium', 'small', 'null']),
        p_value: z.string()
    }),
    root_cause_analysis: z.string(),
    resolution: z.string(),
    confidence_in_resolution: z.number().min(0).max(1)
});

export const SynthesisResultSchema = z.object({
    synthesis_id: z.string(),
    topic: z.string(),
    papers_analyzed: z.number(),
    agreed_findings: z.array(z.object({
        claim: z.string(),
        supporting_papers: z.array(z.string()),
        confidence: z.number().min(0).max(1),
        evidence_strength: z.enum(['strong', 'moderate', 'weak'])
    })),
    contradictions: z.array(ContradictionSchema),
    methodology_comparison: z.object({
        study_types: z.array(z.object({
            type: z.string(),
            count: z.number(),
            avg_quality: z.number()
        })),
        risk_of_bias: z.array(z.string())
    }),
    evidence_gaps: z.array(z.string()),
    synthesis_confidence: z.number().min(0).max(1),
    key_recommendation: z.string(),
    uncertainty_flags: z.array(z.string())
});

export type SynthesisResult = z.infer<typeof SynthesisResultSchema>;
export type Contradiction = z.infer<typeof ContradictionSchema>;

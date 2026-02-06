import { Timestamp } from "firebase/firestore";
import { SynthesisResult, Contradiction } from "./synthesis";

export * from "./synthesis";

export type EvidenceStrength = "strong" | "moderate" | "weak";
export type AnalysisStatus = "idle" | "uploading" | "extracting" | "ready" | "processing" | "complete" | "error";
export type ExtractionStatus = "idle" | "loading" | "success" | "error";

export interface PaperMetadata {
    paper_id: string;
    title: string;
    authors: string[];
    year: number | null;
    doi?: string;
    text_length: number;
}

export interface Paper {
    id?: string; // Firestore document ID
    analysisId: string;
    extractedText: string;
    metadata: PaperMetadata;
    upload_timestamp?: Timestamp;
}

export interface Analysis {
    id?: string; // Firestore document ID
    createdAt: Timestamp;
    status: AnalysisStatus;
    papers: PaperMetadata[];
    synthesisResult: SynthesisResult | null;
    errorMessage: string | null;
    userId: string;
    lastAttemptAt?: Timestamp;
}

// UI specific types
export interface UIState {
    activeTab: 'agreement' | 'contradictions' | 'quality' | 'raw';
    selectedContradictionId: string | null;
    isAnalyzing: boolean;
    error: string | null;
}

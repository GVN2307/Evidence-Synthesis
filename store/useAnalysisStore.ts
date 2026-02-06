import { create } from "zustand";
import { Paper, SynthesisResult, UIState, ExtractionStatus } from "@/types";

interface PapersSlice {
    uploadedPapers: Paper[];
    extractionStatus: Record<string, ExtractionStatus>;
    files: File[];
    setFiles: (files: File[]) => void;
    addFile: (file: File) => void;
    removeFile: (fileName: string) => void;
    setUploadedPapers: (papers: Paper[]) => void;
    setExtractionStatus: (fileName: string, status: ExtractionStatus) => void;
}

interface AnalysisSlice {
    currentAnalysisId: string | null;
    synthesisResult: SynthesisResult | null;
    isAnalyzing: boolean;
    setAnalysisId: (id: string | null) => void;
    setSynthesisResult: (result: SynthesisResult | null) => void;
    setIsAnalyzing: (isAnalyzing: boolean) => void;
}

interface UISlice {
    uiState: UIState;
    setUIState: (updates: Partial<UIState>) => void;
}

type CombinedStore = PapersSlice & AnalysisSlice & UISlice & { reset: () => void };

export const useAnalysisStore = create<CombinedStore>((set) => ({
    // Papers Slice
    uploadedPapers: [],
    extractionStatus: {},
    files: [],
    setFiles: (files) => set({ files }),
    addFile: (file) => set((state) => ({
        files: [...state.files, file],
        extractionStatus: { ...state.extractionStatus, [file.name]: "idle" }
    })),
    removeFile: (fileName) => set((state) => {
        const newStatus = { ...state.extractionStatus };
        delete newStatus[fileName];
        return {
            files: state.files.filter(f => f.name !== fileName),
            extractionStatus: newStatus
        };
    }),
    setUploadedPapers: (uploadedPapers) => set({ uploadedPapers }),
    setExtractionStatus: (fileName, status) => set((state) => ({
        extractionStatus: { ...state.extractionStatus, [fileName]: status }
    })),

    // Analysis Slice
    currentAnalysisId: null,
    synthesisResult: null,
    isAnalyzing: false,
    setAnalysisId: (currentAnalysisId) => set({ currentAnalysisId }),
    setSynthesisResult: (synthesisResult) => set({ synthesisResult }),
    setIsAnalyzing: (isAnalyzing) => set({ isAnalyzing }),

    // UI Slice
    uiState: {
        activeTab: "agreement",
        selectedContradictionId: null,
        isAnalyzing: false,
        error: null,
    },
    setUIState: (updates) => set((state) => ({
        uiState: { ...state.uiState, ...updates }
    })),

    // Global reset
    reset: () => set({
        uploadedPapers: [],
        extractionStatus: {},
        files: [],
        currentAnalysisId: null,
        synthesisResult: null,
        isAnalyzing: false,
        uiState: {
            activeTab: "agreement",
            selectedContradictionId: null,
            isAnalyzing: false,
            error: null,
        },
    }),
}));

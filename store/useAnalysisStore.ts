import { create } from "zustand";
import { Paper, SynthesisResult, UIState, ExtractionStatus, ExtractionErrorCode } from "@/types";

interface PapersSlice {
    uploadedPapers: Paper[];
    extractionStatus: Record<string, ExtractionStatus>;
    extractionErrors: Record<string, ExtractionErrorCode>;
    manualTexts: Record<string, string>;
    files: File[];
    setFiles: (files: File[]) => void;
    addFile: (file: File) => void;
    removeFile: (fileName: string) => void;
    setUploadedPapers: (papers: Paper[]) => void;
    setExtractionStatus: (fileName: string, status: ExtractionStatus) => void;
    setExtractionError: (fileName: string, error: ExtractionErrorCode | null) => void;
    setManualText: (fileName: string, text: string) => void;
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
    extractionErrors: {},
    manualTexts: {},
    files: [],
    setFiles: (files) => set({ files }),
    addFile: (file) => set((state) => ({
        files: [...state.files, file],
        extractionStatus: { ...state.extractionStatus, [file.name]: "idle" },
        extractionErrors: { ...state.extractionErrors, [file.name]: "UNKNOWN_ERROR" }
    })),
    removeFile: (fileName) => set((state) => {
        const newStatus = { ...state.extractionStatus };
        const newErrors = { ...state.extractionErrors };
        const newManualTexts = { ...state.manualTexts };
        delete newStatus[fileName];
        delete newErrors[fileName];
        delete newManualTexts[fileName];
        return {
            files: state.files.filter(f => f.name !== fileName),
            extractionStatus: newStatus,
            extractionErrors: newErrors,
            manualTexts: newManualTexts
        };
    }),
    setUploadedPapers: (uploadedPapers) => set({ uploadedPapers }),
    setExtractionStatus: (fileName, status) => set((state) => ({
        extractionStatus: { ...state.extractionStatus, [fileName]: status }
    })),
    setExtractionError: (fileName, error) => set((state) => {
        const newErrors = { ...state.extractionErrors };
        if (error) newErrors[fileName] = error;
        else delete newErrors[fileName];
        return { extractionErrors: newErrors };
    }),
    setManualText: (fileName, text) => set((state) => ({
        manualTexts: { ...state.manualTexts, [fileName]: text }
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
        extractionErrors: {},
        manualTexts: {},
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

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { db, auth } from "@/lib/firebase";
import {
    collection,
    addDoc,
    serverTimestamp,
    doc,
    getDoc,
    updateDoc,
} from "firebase/firestore";
import { useAnalysisStore } from "@/store/useAnalysisStore";
import { PaperMetadata, Analysis, SynthesisResult, AnalysisStatus } from "@/types";

/**
 * Hook to upload multiple papers and create an analysis record
 */
export function useUploadPapers() {
    return useMutation({
        mutationFn: async (papers: { metadata: PaperMetadata; extractedText: string }[]) => {
            const userId = auth.currentUser?.uid || "demo-user";

            // 1. Create Analysis Document
            const analysisRef = await addDoc(collection(db, "analyses"), {
                userId,
                status: "extracting",
                papers: papers.map(p => p.metadata),
                createdAt: serverTimestamp(),
            });

            // 2. Create Paper Documents
            const paperRefs = await Promise.all(
                papers.map(p =>
                    addDoc(collection(db, "papers"), {
                        analysisId: analysisRef.id,
                        userId,
                        metadata: p.metadata,
                        extractedText: p.extractedText,
                        upload_timestamp: serverTimestamp()
                    })
                )
            );

            return { analysisId: analysisRef.id, paperIds: paperRefs.map(r => r.id) };
        },
    });
}

/**
 * Hook to trigger the AI analysis engine
 */
export function useRunAnalysis() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (analysisId: string) => {
            // Update status to analyzing
            const analysisRef = doc(db, "analyses", analysisId);
            await updateDoc(analysisRef, { status: "analyzing" });

            // Call API
            const response = await fetch("/api/analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ analysisId }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Analysis failed");
            }

            return response.json();
        },
        onSuccess: (_, analysisId) => {
            queryClient.invalidateQueries({ queryKey: ["analysis", analysisId] });
        },
    });
}

/**
 * Hook to fetch analysis status and results
 */
export function useAnalysisStatus(analysisId: string) {
    return useQuery<Analysis>({
        queryKey: ["analysis", analysisId],
        queryFn: async () => {
            if (!analysisId) throw new Error("Analysis ID required");
            const docRef = doc(db, "analyses", analysisId);
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) {
                throw new Error("Analysis not found");
            }

            const data = docSnap.data();
            return {
                id: docSnap.id,
                ...data
            } as Analysis;
        },
        enabled: !!analysisId,
        refetchInterval: (query) => {
            const data = query.state.data as Analysis | undefined;
            if (data?.status === "complete" || data?.status === "error") {
                return false;
            }
            return 3000; // Poll every 3 seconds while analyzing
        },
    });
}

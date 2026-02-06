"use client";

import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useAnalysisStore } from "@/store/useAnalysisStore";
import { Card } from "@/components/ui/card";
import { Upload, X, FileText, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { useUploadPapers } from "@/hooks/useAnalysis";
import { Paper } from "@/types";
import { useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

export function PDFUpload() {
    const {
        files,
        addFile,
        removeFile,
        extractionStatus,
        extractionErrors,
        setExtractionStatus,
        setExtractionError,
        setManualText,
        manualTexts,
        setUIState,
        reset
    } = useAnalysisStore();
    const router = useRouter();

    const [isInternalProcessing, setIsInternalProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showManualPaste, setShowManualPaste] = useState<string | null>(null);
    const [tempManualText, setTempManualText] = useState("");

    const uploadMutation = useUploadPapers();

    const onDrop = useCallback((acceptedFiles: File[]) => {
        setError(null);
        acceptedFiles.forEach((file) => {
            if (files.length < 5) {
                addFile(file);
            }
        });
    }, [files, addFile]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { "application/pdf": [".pdf"] },
        maxFiles: 5,
        disabled: isInternalProcessing || files.length >= 5,
    });

    const handleStartAnalysis = async () => {
        setIsInternalProcessing(true);
        setError(null);

        try {
            const extractedData: Partial<Paper>[] = [];

            for (const file of files) {
                setExtractionStatus(file.name, "loading");

                try {
                    // MULTIMODAL GEMINI EXTRACTION
                    const formData = new FormData();
                    formData.append("file", file);

                    const response = await fetch("/api/analyze-pdf", {
                        method: "POST",
                        body: formData,
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        setExtractionError(file.name, errorData.code || "UNKNOWN_ERROR");
                        throw new Error(errorData.error || `Failed to process ${file.name}`);
                    }

                    const data = await response.json();
                    const extracted = data.extractedData;

                    extractedData.push({
                        extractedText: extracted.full_text,
                        tables: extracted.tables || [],
                        figures: extracted.figures || [],
                        key_findings: extracted.key_findings || [],
                        metadata: {
                            paper_id: Math.random().toString(36).substring(7),
                            title: extracted.metadata.title || file.name.replace(".pdf", ""),
                            authors: extracted.metadata.authors || ["Unknown"],
                            year: extracted.metadata.year || new Date().getFullYear(),
                            keywords: extracted.metadata.keywords || [],
                            text_length: extracted.full_text.length
                        }
                    });

                    setExtractionStatus(file.name, "success");
                } catch (err) {
                    // Check if we have manual text already
                    if (manualTexts[file.name]) {
                        extractedData.push({
                            extractedText: manualTexts[file.name],
                            metadata: {
                                paper_id: Math.random().toString(36).substring(7),
                                title: file.name.replace(".pdf", ""),
                                authors: ["Unknown"],
                                year: new Date().getFullYear(),
                                text_length: manualTexts[file.name].length
                            }
                        });
                        setExtractionStatus(file.name, "success");
                    } else {
                        console.error(`Extraction failed for ${file.name}:`, err);
                        setExtractionStatus(file.name, "error");
                        const errorMessage = err instanceof Error ? err.message : "Extraction failed";
                        setError(`Failed to process ${file.name}: ${errorMessage}`);
                        return; // Stop processing batch
                    }
                }
            }

            // Status transition: extracting -> uploading (handled by mutation)
            const analysisId = await uploadMutation.mutateAsync(extractedData);

            // On success, navigate to dashboard
            router.push(`/dashboard?id=${analysisId}`);

            // On success, the hook sets status to 'ready' in Firestore and we redirect or show results
            setUIState({ isAnalyzing: false });
        } catch (err) {
            console.error(err);
            const errorMessage = err instanceof Error ? err.message : "Failed to process PDFs.";
            setError(`${errorMessage}`);
        } finally {
            setIsInternalProcessing(false);
        }
    };

    return (
        <div className="space-y-6 w-full max-w-2xl mx-auto">
            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <Card
                {...getRootProps()}
                className={cn(
                    "relative border-2 border-dashed transition-all duration-200 cursor-pointer p-12 text-center",
                    isDragActive ? "border-agreement bg-agreement/5" : "border-slate-800 hover:border-slate-700 bg-slate-900/50",
                    (isInternalProcessing || files.length >= 5) && "opacity-50 cursor-not-allowed"
                )}
            >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center gap-4">
                    <div className="p-4 rounded-full bg-slate-800 text-slate-400">
                        <Upload className="w-8 h-8" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-semibold">
                            {isDragActive ? "Drop papers here" : "Drag & drop research papers"}
                        </h3>
                        <p className="text-slate-400">
                            Support 2-5 PDFs simultaneously (Max 10MB each)
                        </p>
                    </div>
                </div>
            </Card>

            {files.length > 0 && (
                <div className="space-y-3">
                    {files.map((file) => (
                        <Card key={file.name} className="bg-slate-900 border-slate-800 p-4">
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <FileText className={cn(
                                        "w-5 h-5 shrink-0",
                                        extractionStatus[file.name] === "success" ? "text-agreement" : "text-blue-400"
                                    )} />
                                    <span className="truncate text-sm font-medium">{file.name}</span>
                                    <span className="text-xs text-slate-500 shrink-0">
                                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                                    </span>
                                </div>
                                {!isInternalProcessing && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="shrink-0 hover:text-contradiction"
                                        onClick={() => removeFile(file.name)}
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>

                            {extractionStatus[file.name] === "loading" && (
                                <div className="mt-3 space-y-1">
                                    <div className="flex justify-between text-[10px] text-slate-400">
                                        <span>Extracting Text...</span>
                                    </div>
                                    <Progress value={45} className="h-1 animate-pulse" />
                                </div>
                            )}

                            {extractionStatus[file.name] === "error" && (
                                <div className="mt-2 space-y-2">
                                    <p className="text-[10px] text-contradiction flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" /> Extraction failed: {extractionErrors[file.name]}
                                    </p>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-7 text-[10px] border-contradiction/50 text-contradiction hover:bg-contradiction/10"
                                        onClick={() => {
                                            setTempManualText(manualTexts[file.name] || "");
                                            setShowManualPaste(file.name);
                                        }}
                                    >
                                        Paste Text Manually
                                    </Button>
                                    {manualTexts[file.name] && (
                                        <p className="text-[10px] text-agreement flex items-center gap-1">
                                            ✓ Manual text provided ({manualTexts[file.name].length} chars)
                                        </p>
                                    )}
                                </div>
                            )}
                        </Card>
                    ))}

                    <div className="pt-4 flex justify-between items-center">
                        <Button variant="ghost" onClick={reset} disabled={isInternalProcessing} className="text-slate-400">
                            Clear All
                        </Button>
                        <Button
                            className="bg-agreement text-slate-950 font-bold px-8 hover:bg-agreement/90"
                            disabled={files.length < 2 || isInternalProcessing}
                            onClick={handleStartAnalysis}
                        >
                            {isInternalProcessing ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>
                                        {uploadMutation.isPending ? "Uploading..." :
                                            files.some(f => extractionStatus[f.name] === 'loading') ? "Extracting..." :
                                                "Synthesizing..."}
                                    </span>
                                </div>
                            ) : (
                                "Start Synthesis"
                            )}
                        </Button>
                    </div>
                </div>
            )}
            {/* Manual Paste Dialog */}
            <Dialog open={!!showManualPaste} onOpenChange={() => setShowManualPaste(null)}>
                <DialogContent className="sm:max-w-[600px] bg-slate-950 border-slate-800">
                    <DialogHeader>
                        <DialogTitle>Manual Text Input</DialogTitle>
                        <DialogDescription className="text-slate-400">
                            Automated extraction failed for <strong>{showManualPaste}</strong>.
                            Please copy and paste the text content from the PDF below to continue.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Textarea
                            placeholder="Paste text here... (Min 50 characters)"
                            className="min-h-[300px] bg-slate-900 border-slate-700 font-mono text-sm"
                            value={tempManualText}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setTempManualText(e.target.value)}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setShowManualPaste(null)}>Cancel</Button>
                        <Button
                            className="bg-agreement text-slate-950 font-bold"
                            disabled={tempManualText.length < 50}
                            onClick={() => {
                                if (showManualPaste) {
                                    setManualText(showManualPaste, tempManualText);
                                    setExtractionStatus(showManualPaste, "idle"); // Reset status so they can try start analysis again
                                    setShowManualPaste(null);
                                }
                            }}
                        >
                            Save Manual Text
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

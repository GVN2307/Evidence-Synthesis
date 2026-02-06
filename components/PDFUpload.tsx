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
import { extractTextFromPDF, extractMetadata } from "@/lib/pdf-utils";
import { useUploadPapers } from "@/hooks/useAnalysis";
import { PaperMetadata } from "@/types";

export function PDFUpload() {
    const {
        files,
        addFile,
        removeFile,
        extractionStatus,
        setExtractionStatus,
        setUIState,
        reset
    } = useAnalysisStore();

    const [localExtractionProgress, setLocalExtractionProgress] = useState<Record<string, number>>({});
    const [isInternalProcessing, setIsInternalProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
            const extractedData: { extractedText: string; metadata: PaperMetadata }[] = [];

            for (const file of files) {
                setExtractionStatus(file.name, "loading");

                try {
                    const text = await extractTextFromPDF(file, (p) => {
                        setLocalExtractionProgress(prev => ({ ...prev, [file.name]: p }));
                    });

                    const metadata = extractMetadata(file);
                    extractedData.push({
                        extractedText: text,
                        metadata: {
                            paper_id: Math.random().toString(36).substring(7),
                            title: metadata.title,
                            authors: metadata.authors,
                            year: metadata.year,
                            text_length: text.length
                        }
                    });

                    setExtractionStatus(file.name, "success");
                } catch {
                    setExtractionStatus(file.name, "error");
                    throw new Error(`Failed to extract text from ${file.name}`);
                }
            }

            // Status transition: extracting -> uploading (handled by mutation)
            await uploadMutation.mutateAsync(extractedData);

            // On success, the hook sets status to 'ready' in Firestore and we redirect or show results
            setUIState({ isAnalyzing: false });
        } catch (err) {
            console.error(err);
            const errorMessage = err instanceof Error ? err.message : "Failed to process PDFs.";
            setError(`${errorMessage} Please ensure they are valid and not password protected.`);
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
                                        <span>{localExtractionProgress[file.name] || 0}%</span>
                                    </div>
                                    <Progress value={localExtractionProgress[file.name] || 0} className="h-1" />
                                </div>
                            )}

                            {extractionStatus[file.name] === "error" && (
                                <p className="mt-2 text-[10px] text-contradiction flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" /> Extraction failed
                                </p>
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
        </div>
    );
}

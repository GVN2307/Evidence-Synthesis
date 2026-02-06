"use client";

import { useSearchParams } from "next/navigation";
import { useAnalysisStatus } from "@/hooks/useAnalysis";
import { useAnalysisStore } from "@/store/useAnalysisStore";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertCircle, FileText, Share2, Download, Zap } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { AgreementGraph } from "@/components/AgreementGraph";
import { ContradictionCard } from "@/components/ContradictionCard";
import { EvidenceQuality } from "@/components/EvidenceQuality";
import { RawSynthesis } from "@/components/RawSynthesis";
import { WhatIfAnalysis } from "@/components/WhatIfAnalysis";
import { Button } from "@/components/ui/button";

import { Suspense } from "react";

function DashboardContent() {
    const searchParams = useSearchParams();
    const analysisId = searchParams.get("id") || "";
    const { data: analysis, isLoading, error } = useAnalysisStatus(analysisId);
    const { setUIState } = useAnalysisStore();

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <p className="text-slate-400 animate-pulse">Synthesizing evidence...</p>
            </div>
        );
    }

    if (error || !analysis) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4">
                <AlertCircle className="w-12 h-12 text-contradiction" />
                <h2 className="text-2xl font-bold text-white">Analysis Not Found</h2>
                <p className="text-slate-400">{error?.message || "Verify the analysis ID."}</p>
            </div>
        );
    }

    const { synthesisResult } = analysis;

    if (!synthesisResult) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-6 max-w-md mx-auto text-center">
                <div className="p-6 rounded-full bg-uncertainty/10 text-uncertainty">
                    <Zap className="w-12 h-12 animate-pulse" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-white">Synthesis in Progress</h2>
                    <p className="text-slate-400">
                        Gemini is currently distilling the evidence. This usually takes 30-60 seconds...
                    </p>
                </div>
                <Progress value={45} className="h-2 w-full bg-slate-800" />
            </div>
        );
    }

    const confidencePercentage = Math.round(synthesisResult.synthesis_confidence * 100);

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-[#f8fafc] p-6 lg:p-10">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <Badge variant="outline" className="border-primary/50 text-primary bg-primary/5 px-3 py-1">
                            {synthesisResult.topic.toUpperCase()}
                        </Badge>
                        <Badge variant="secondary" className="bg-slate-800 text-slate-300">
                            {synthesisResult.papers_analyzed} Papers
                        </Badge>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                        Evidence Synthesis
                    </h1>
                </div>

                <div className="flex items-center gap-6 bg-[#151520] p-4 rounded-xl border border-slate-800">
                    <div className="text-right">
                        <p className="text-xs text-slate-400 uppercase font-mono tracking-widest">Global Confidence</p>
                        <p className="text-2xl font-bold text-agreement font-mono">{confidencePercentage}%</p>
                    </div>
                    <div className="relative w-16 h-16">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle
                                cx="32"
                                cy="32"
                                r="28"
                                fill="none"
                                stroke="#1e293b"
                                strokeWidth="4"
                            />
                            <circle
                                cx="32"
                                cy="32"
                                r="28"
                                fill="none"
                                stroke="#10b981"
                                strokeWidth="4"
                                strokeDasharray={175.9}
                                strokeDashoffset={175.9 - (175.9 * confidencePercentage) / 100}
                                strokeLinecap="round"
                            />
                        </svg>
                    </div>
                </div>
            </header>

            {/* Main Tabs */}
            <Tabs defaultValue="agreement" className="space-y-8" onValueChange={(v) => setUIState({ activeTab: v as "agreement" | "contradictions" | "quality" | "raw" })}>
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                    <TabsList className="bg-[#151520] border-slate-800 p-1">
                        <TabsTrigger value="agreement" className="px-6 py-2.5 data-[state=active]:bg-primary">
                            Agreement Map
                        </TabsTrigger>
                        <TabsTrigger value="contradictions" className="px-6 py-2.5 data-[state=active]:bg-contradiction">
                            Contradictions
                        </TabsTrigger>
                        <TabsTrigger value="quality" className="px-6 py-2.5 data-[state=active]:bg-uncertainty">
                            Evidence Quality
                        </TabsTrigger>
                        <TabsTrigger value="raw" className="px-6 py-2.5 data-[state=active]:bg-slate-700">
                            Raw Data
                        </TabsTrigger>
                    </TabsList>

                    <div className="flex items-center gap-3">
                        <WhatIfAnalysis analysis={analysis} />
                        <Button variant="outline" size="sm" className="bg-slate-900 border-slate-800 gap-2">
                            <Download className="w-4 h-4" /> Export Report
                        </Button>
                        <Button variant="outline" size="sm" className="bg-slate-900 border-slate-800">
                            <Share2 className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                <TabsContent value="agreement" className="mt-0">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-[600px]">
                        <Card className="lg:col-span-3 bg-[#151520] border-slate-800 overflow-hidden relative">
                            <AgreementGraph synthesisResult={synthesisResult} papers={analysis.papers} />
                        </Card>
                        <div className="space-y-6">
                            <Card className="bg-primary/5 border-primary/20 p-6 space-y-4">
                                <h3 className="text-lg font-bold flex items-center gap-2">
                                    <Zap className="w-5 h-5 text-primary" /> Key Verdict
                                </h3>
                                <p className="text-sm leading-relaxed text-slate-300 italic">
                                    &quot;{synthesisResult.key_recommendation}&quot;
                                </p>
                            </Card>
                            <Card className="bg-[#151520] border-slate-800 p-6">
                                <h3 className="text-sm font-bold text-slate-400 uppercase mb-4 tracking-widest">Top Agreed Findings</h3>
                                <div className="space-y-4">
                                    {synthesisResult.agreed_findings.slice(0, 3).map((f, i) => (
                                        <div key={i} className="space-y-1">
                                            <p className="text-sm font-medium">{f.claim}</p>
                                            <div className="flex items-center gap-2">
                                                <div className="flex -space-x-2">
                                                    {f.supporting_papers.map((p, j) => (
                                                        <div key={j} className="w-6 h-6 rounded-full bg-slate-700 border border-slate-900 flex items-center justify-center text-[10px]">
                                                            {p}
                                                        </div>
                                                    ))}
                                                </div>
                                                <Badge variant="outline" className="text-[10px] border-agreement/20 text-agreement">
                                                    {Math.round(f.confidence * 100)}% Conf
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="contradictions" className="mt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {synthesisResult.contradictions.length > 0 ? (
                            synthesisResult.contradictions.map((c) => (
                                <ContradictionCard key={c.id} contradiction={c} />
                            ))
                        ) : (
                            <div className="col-span-full py-20 text-center space-y-4">
                                <div className="p-4 rounded-full bg-agreement/10 text-agreement w-16 h-16 mx-auto flex items-center justify-center">
                                    <FileText className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-bold">No High-Confidence Contradictions</h3>
                                <p className="text-slate-400">All analyzed papers appear to align on core metrics.</p>
                            </div>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="quality" className="mt-0">
                    <EvidenceQuality synthesisResult={synthesisResult} papers={analysis.papers} />
                </TabsContent>

                <TabsContent value="raw" className="mt-0">
                    <RawSynthesis result={synthesisResult} />
                </TabsContent>
            </Tabs>
        </div>
    );
}

export default function AnalysisDashboard() {
    return (
        <Suspense fallback={
            <div className="flex flex-col items-center justify-center min-h-screen gap-4">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <p className="text-slate-400">Loading analysis...</p>
            </div>
        }>
            <DashboardContent />
        </Suspense>
    );
}

"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Analysis } from "@/types";
import { Switch } from "@/components/ui/switch";
import { Beaker, TrendingDown, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

interface WhatIfAnalysisProps {
    analysis: Analysis;
}

export function WhatIfAnalysis({ analysis }: WhatIfAnalysisProps) {
    const [excludedIds, setExcludedIds] = useState<string[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    const togglePaper = (id: string) => {
        setExcludedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const impactScore = excludedIds.length > 0 ? (excludedIds.length / analysis.papers.length) * 100 : 0;

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "inline-flex items-center gap-2 px-4 py-2 rounded-md font-bold text-xs border transition-all",
                    excludedIds.length > 0
                        ? "bg-uncertainty/20 border-uncertainty text-uncertainty shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:border-primary/50"
                )}
            >
                <Beaker className="w-4 h-4" />
                {excludedIds.length > 0 ? `Hypothetical: -${excludedIds.length} Papers` : '"What If" Mode'}
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40 bg-[#0a0a0f]/60 backdrop-blur-sm"
                        onClick={() => setIsOpen(false)}
                    />
                    <Card className="absolute top-full mt-4 right-0 w-[400px] bg-[#151520] border-slate-700 shadow-2xl z-50 overflow-hidden">
                        <div className="p-4 border-b border-slate-700 bg-slate-900/50 flex justify-between items-center">
                            <h3 className="text-sm font-bold flex items-center gap-2">
                                <Filter className="w-4 h-4 text-primary" /> Sensitivity Analysis
                            </h3>
                            <Badge className="bg-primary/20 text-primary border-0">ACTIVE</Badge>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="space-y-4">
                                <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Toggle Papers to Recalculate</p>
                                <div className="space-y-3">
                                    {analysis.papers.map((p) => (
                                        <div key={p.paper_id} className="flex items-center justify-between gap-4 p-2 rounded-lg bg-[#0a0a0f] border border-slate-800/50">
                                            <div className="flex flex-col overflow-hidden">
                                                <span className="text-[10px] font-mono text-slate-500">#{p.paper_id}</span>
                                                <span className="text-xs font-bold truncate text-slate-300">{p.title}</span>
                                            </div>
                                            <Switch
                                                checked={!excludedIds.includes(p.paper_id)}
                                                onCheckedChange={() => togglePaper(p.paper_id)}
                                                className="data-[state=checked]:bg-agreement"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {excludedIds.length > 0 && (
                                <div className="space-y-4 pt-4 border-t border-slate-800">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded bg-contradiction/10">
                                            <TrendingDown className="w-4 h-4 text-contradiction" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-slate-500 uppercase font-bold">Inference Shift</p>
                                            <p className="text-xs text-slate-200">Confidence would drop by <span className="text-contradiction font-bold">{impactScore.toFixed(0)}%</span></p>
                                        </div>
                                    </div>
                                    <div className="p-3 rounded-lg bg-uncertainty/5 border border-uncertainty/10 text-[10px] text-uncertainty/80 leading-relaxed italic">
                                        &quot;Removing these studies eliminates direct contradictions in methodology, but reduces overall statistical power of the synthesis.&quot;
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-full py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90 transition-colors"
                            >
                                Apply Hypothetical Layout
                            </button>
                        </div>
                    </Card>
                </>
            )}
        </div>
    );
}

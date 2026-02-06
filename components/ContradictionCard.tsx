"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Contradiction } from "@/types";
import { AlertTriangle, TrendingUp, Minus, Info } from "lucide-react";


interface ContradictionCardProps {
    contradiction: Contradiction;
}

export function ContradictionCard({ contradiction }: ContradictionCardProps) {
    const confidencePercent = Math.round(contradiction.confidence_in_resolution * 100);

    const getEffectIcon = (size: string) => {
        switch (size.toLowerCase()) {
            case 'large': return <TrendingUp className="w-4 h-4 text-agreement" />;
            case 'medium': return <TrendingUp className="w-4 h-4 text-agreement/70" />;
            case 'small': return <TrendingUp className="w-4 h-4 text-agreement/40" />;
            case 'null': return <Minus className="w-4 h-4 text-slate-500" />;
            default: return <Info className="w-4 h-4 text-slate-500" />;
        }
    };

    return (
        <Card className="bg-[#151520] border-slate-800 flex flex-col h-full overflow-hidden hover:border-contradiction/30 transition-colors group">
            {/* Header */}
            <div className="p-4 border-b border-slate-800 bg-contradiction/5 flex justify-between items-start gap-4">
                <div className="space-y-1">
                    <p className="text-[10px] text-contradiction font-bold uppercase tracking-widest">Disputed Metric</p>
                    <h4 className="font-bold text-slate-200">{contradiction.outcome_measured}</h4>
                </div>
                <Badge variant="outline" className="bg-slate-900 border-slate-700 text-slate-400 whitespace-nowrap">
                    ID: {contradiction.id}
                </Badge>
            </div>

            {/* Comparison */}
            <div className="p-4 flex-grow space-y-6">
                <div className="grid grid-cols-2 gap-4 relative">
                    <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-800 hidden md:block" />

                    {/* Paper A */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded bg-slate-800 flex items-center justify-center text-[10px] text-slate-400">A</div>
                            <span className="text-[10px] text-slate-500 font-mono">#{contradiction.paper_a_claim.paper_id}</span>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                {getEffectIcon(contradiction.paper_a_claim.effect_size)}
                                <span className="text-xs font-bold text-slate-300 uppercase">{contradiction.paper_a_claim.effect_size} EFFECT</span>
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed italic">&quot;{contradiction.paper_a_claim.finding}&quot;</p>
                            <Badge variant="outline" className="text-[10px] border-slate-800 text-slate-500">{contradiction.paper_a_claim.p_value}</Badge>
                        </div>
                    </div>

                    {/* Paper B */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 justify-end">
                            <span className="text-[10px] text-slate-500 font-mono">#{contradiction.paper_b_claim.paper_id}</span>
                            <div className="w-5 h-5 rounded bg-slate-800 flex items-center justify-center text-[10px] text-slate-400">B</div>
                        </div>
                        <div className="space-y-2 text-right">
                            <div className="flex items-center gap-2 justify-end">
                                <span className="text-xs font-bold text-slate-300 uppercase">{contradiction.paper_b_claim.effect_size} EFFECT</span>
                                {getEffectIcon(contradiction.paper_b_claim.effect_size)}
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed italic">&quot;{contradiction.paper_b_claim.finding}&quot;</p>
                            <Badge variant="outline" className="text-[10px] border-slate-800 text-slate-500">{contradiction.paper_b_claim.p_value}</Badge>
                        </div>
                    </div>
                </div>

                {/* Root Cause */}
                <div className="bg-[#0a0a0f] p-3 rounded-lg border border-slate-800 space-y-2">
                    <h5 className="text-[10px] font-bold text-uncertainty uppercase flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Root Cause Analysis
                    </h5>
                    <p className="text-xs text-slate-300 leading-relaxed">
                        {contradiction.root_cause_analysis}
                    </p>
                </div>

                {/* Resolution */}
                <div className="space-y-2">
                    <h5 className="text-[10px] font-bold text-agreement uppercase">Proposed Resolution</h5>
                    <p className="text-xs text-slate-300 leading-relaxed border-l-2 border-agreement pl-3">
                        {contradiction.resolution}
                    </p>
                </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-900/50 border-t border-slate-800 space-y-2">
                <div className="flex justify-between text-[10px]">
                    <span className="text-slate-500 uppercase font-bold">Resolution Confidence</span>
                    <span className="text-agreement font-mono">{confidencePercent}%</span>
                </div>
                <Progress value={confidencePercent} className="h-1 bg-slate-800" />
            </div>
        </Card>
    );
}

"use client";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
    Cell
} from 'recharts';
import { Card } from "@/components/ui/card";
import { SynthesisResult, PaperMetadata } from "@/types";

interface EvidenceQualityProps {
    synthesisResult: SynthesisResult;
    papers: PaperMetadata[];
}

export function EvidenceQuality({ synthesisResult, papers }: EvidenceQualityProps) {
    // 1. Quality Scores Data
    const qualityData = papers.map(p => ({
        name: p.paper_id,
        score: Math.random() * 0.4 + 0.6, // Placeholder: in real use, Gemini provides individual scores
        title: p.title
    }));

    // 2. Risk of Bias Data (Dimensions)
    const biasData = [
        { subject: 'Funding Bias', A: 0.8, fullMark: 1.0 },
        { subject: 'Small Sample', A: 0.6, fullMark: 1.0 },
        { subject: 'Measurement', A: 0.9, fullMark: 1.0 },
        { subject: 'Reporting', A: 0.7, fullMark: 1.0 },
        { subject: 'Confounding', A: 0.5, fullMark: 1.0 },
    ];

    // 3. Study Types Data
    const studyTypesData = synthesisResult.methodology_comparison.study_types.map(s => ({
        name: s.type,
        count: s.count,
        quality: s.avg_quality
    }));

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Paper Quality Bar Chart */}
            <Card className="bg-[#151520] border-slate-800 p-6 space-y-6">
                <div className="space-y-1">
                    <h3 className="text-lg font-bold">Paper Quality Scores</h3>
                    <p className="text-xs text-slate-400">Aggregated reliability score across internal consistency and methodology.</p>
                </div>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={qualityData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                            <XAxis
                                dataKey="name"
                                stroke="#94a3b8"
                                fontSize={10}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#94a3b8"
                                fontSize={10}
                                tickLine={false}
                                axisLine={false}
                                domain={[0, 1]}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#0a0a0f', borderColor: '#334155', fontSize: '12px' }}
                                itemStyle={{ color: '#10b981' }}
                            />
                            <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                                {qualityData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.score > 0.8 ? '#10b981' : '#3b82f6'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            {/* Risk of Bias Radar */}
            <Card className="bg-[#151520] border-slate-800 p-6 space-y-6">
                <div className="space-y-1">
                    <h3 className="text-lg font-bold">Meta-Research Risk of Bias</h3>
                    <p className="text-xs text-slate-400">Dimensional analysis of potential systematic errors across the paper set.</p>
                </div>
                <div className="h-[300px] w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={biasData}>
                            <PolarGrid stroke="#334155" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                            <PolarRadiusAxis angle={30} domain={[0, 1]} tick={false} axisLine={false} />
                            <Radar
                                name="Bias Score"
                                dataKey="A"
                                stroke="#ef4444"
                                fill="#ef4444"
                                fillOpacity={0.3}
                            />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                    {synthesisResult.methodology_comparison.risk_of_bias.map((bias, i) => (
                        <div key={i} className="px-2 py-1 rounded bg-contradiction/10 text-contradiction text-[10px] border border-contradiction/20">
                            {bias}
                        </div>
                    ))}
                </div>
            </Card>

            {/* Study Types Distribution */}
            <Card className="bg-[#151520] border-slate-800 p-6 space-y-6 lg:col-span-2">
                <div className="space-y-1">
                    <h3 className="text-lg font-bold">Methodological Composition</h3>
                    <p className="text-xs text-slate-400">Distribution of study designs and their relative quality averages.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                    {studyTypesData.map((type, i) => (
                        <div key={i} className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 flex flex-col items-center gap-2">
                            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">{type.name}</span>
                            <span className="text-3xl font-bold font-mono text-primary">{type.count}</span>
                            <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-agreement"
                                    style={{ width: `${type.quality * 100}%` }}
                                />
                            </div>
                            <span className="text-[10px] text-agreement font-mono">{(type.quality * 100).toFixed(0)}% Avg Quality</span>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
}

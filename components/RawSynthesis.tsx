"use client";

import { Card } from "@/components/ui/card";
import { SynthesisResult } from "@/types";
import { Copy, FileDown, Code, CheckCircle2 } from "lucide-react";
import { useState } from "react";

interface RawSynthesisProps {
    result: SynthesisResult;
}

export function RawSynthesis({ result }: RawSynthesisProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(JSON.stringify(result, null, 2));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Card className="bg-[#151520] border-slate-800 overflow-hidden">
            <div className="p-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Code className="w-4 h-4 text-primary" />
                    <span className="text-xs font-bold uppercase tracking-widest">Synthesis JSON Output</span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleCopy}
                        className="p-2 hover:bg-slate-800 rounded-md transition-colors flex items-center gap-2 text-[10px] font-bold text-slate-400"
                    >
                        {copied ? (
                            <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-agreement" />
                                <span className="text-agreement">COPIED</span>
                            </>
                        ) : (
                            <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>COPY JSON</span>
                            </>
                        )}
                    </button>
                    <button className="p-2 hover:bg-slate-800 rounded-md transition-colors flex items-center gap-2 text-[10px] font-bold text-slate-400">
                        <FileDown className="w-3.5 h-3.5" />
                        <span>DOWNLOAD .MD</span>
                    </button>
                </div>
            </div>
            <div className="p-6">
                <pre className="bg-[#0a0a0f] p-6 rounded-xl border border-slate-800 overflow-x-auto">
                    <code className="text-[10px] md:text-sm font-mono text-agreement leading-relaxed">
                        {JSON.stringify(result, null, 2)}
                    </code>
                </pre>
            </div>
        </Card>
    );
}

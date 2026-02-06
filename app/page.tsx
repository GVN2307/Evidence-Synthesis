"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Shield, FileText, Zap, BarChart3, Binary, ArrowRight } from "lucide-react";

import { PDFUpload } from "@/components/PDFUpload";
import { TourMode } from "@/components/TourMode";

export default function Home() {
    return (
        <main className="min-h-screen p-8 max-w-7xl mx-auto space-y-12 pb-24">
            <TourMode />
            <header className="space-y-4 text-center">
                <div className="flex justify-center mb-6">
                    <div className="p-3 rounded-2xl bg-agreement/10 border border-agreement/20">
                        <Shield className="w-12 h-12 text-agreement" />
                    </div>
                </div>
                <h1 className="text-6xl font-extrabold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                    EvidenceSynthesis
                </h1>
                <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                    AI-Powered Cross-Document Research Analysis. Detect contradictions, synthesize evidence, and quantify confidence.
                </p>

                <div className="flex justify-center gap-4 pt-4">
                    <QuickDemoButton />
                </div>
            </header>

            <section className="flex flex-col items-center gap-12">
                <PDFUpload />
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-12 border-t border-slate-900">
                {[
                    {
                        title: "Multi-PDF Synthesis",
                        desc: "Analyze up to 5 research papers simultaneously with Gemini 1.5 Pro.",
                        icon: FileText,
                        color: "text-blue-400"
                    },
                    {
                        title: "Contradiction Detection",
                        desc: "Identify root causes of disagreements between studies on the same outcome.",
                        icon: Binary,
                        color: "text-contradiction"
                    },
                    {
                        title: "Confidence Scoring",
                        desc: "Quantitative evidence quality scores based on methodology and sample size.",
                        icon: Zap,
                        color: "text-uncertainty"
                    },
                    {
                        title: "Evidence Mapping",
                        desc: "Interactive React Flow network graphs visualizing agreement and disagreement.",
                        icon: BarChart3,
                        color: "text-agreement"
                    }
                ].map((feature, i) => (
                    <Card key={i} className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
                        <CardHeader>
                            <feature.icon className={`w-8 h-8 ${feature.color} mb-2`} />
                            <CardTitle className="text-lg">{feature.title}</CardTitle>
                            <CardDescription className="text-slate-400">{feature.desc}</CardDescription>
                        </CardHeader>
                    </Card>
                ))}
            </section>
        </main>
    );
}

function QuickDemoButton() {
    const [isSeeding, setIsSeeding] = useState(false);
    const router = useRouter();

    const handleDemo = async () => {
        setIsSeeding(true);
        try {
            const { seedDemoData } = await import("@/lib/demo-data");
            const id = await seedDemoData();
            router.push(`/dashboard/${id}`);
        } catch (e) {
            console.error(e);
            setIsSeeding(false);
        }
    };

    return (
        <Button
            onClick={handleDemo}
            disabled={isSeeding}
            className="bg-primary hover:bg-primary/90 text-white font-bold h-12 px-8 rounded-xl shadow-lg shadow-primary/20 transition-all hover:scale-105"
        >
            {isSeeding ? (
                <>
                    <Zap className="w-4 h-4 mr-2 animate-spin" /> Seeding Demo...
                </>
            ) : (
                <>
                    Launch Quick Demo <ArrowRight className="w-4 h-4 ml-2" />
                </>
            )}
        </Button>
    );
}

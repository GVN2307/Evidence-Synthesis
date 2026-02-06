"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, ArrowRight, MousePointer2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const steps = [
    {
        target: "upload-zone",
        content: "Start by dropping 2-5 research papers here. We support academic PDF formats.",
        position: "bottom"
    },
    {
        target: "agreement-tab",
        content: "The Agreement Map visualizes shared findings across studies in real-time.",
        position: "top"
    },
    {
        target: "contradiction-tab",
        content: "Deep-dive into conflicting data. We analyze root causes like population and dose bias.",
        position: "top"
    },
    {
        target: "what-if-mode",
        content: "Perform sensitivity analysis. Toggle papers to see how conclusions shift.",
        position: "left"
    }
];

export function TourMode() {
    const [currentStep, setCurrentStep] = useState(-1);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const hasSeenTour = localStorage.getItem("hasSeenTour");
        if (!hasSeenTour) {
            setMounted(true);
            setTimeout(() => setCurrentStep(0), 1000);
        }
    }, []);

    if (currentStep === -1 || !mounted) return null;

    const step = steps[currentStep];

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            localStorage.setItem("hasSeenTour", "true");
            setCurrentStep(-1);
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] pointer-events-none">
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />

                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full max-w-sm pointer-events-auto"
                >
                    <Card className="bg-[#151520] border-primary/50 shadow-[0_0_30px_rgba(59,130,246,0.2)] p-6 space-y-4">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-2">
                                <MousePointer2 className="w-4 h-4 text-primary" />
                                <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Guide: Step {currentStep + 1}/4</span>
                            </div>
                            <button
                                onClick={() => { setCurrentStep(-1); localStorage.setItem("hasSeenTour", "true"); }}
                                className="text-slate-500 hover:text-white"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <p className="text-sm text-slate-200 leading-relaxed font-medium">
                            {step.content}
                        </p>

                        <div className="flex justify-between items-center pt-2">
                            <button
                                onClick={() => { setCurrentStep(-1); localStorage.setItem("hasSeenTour", "true"); }}
                                className="text-[10px] text-slate-500 hover:underline font-bold"
                            >
                                SKIP TOUR
                            </button>
                            <Button onClick={handleNext} size="sm" className="gap-2 bg-primary">
                                {currentStep === steps.length - 1 ? "Get Started" : "Next Step"} <ArrowRight className="w-3.5 h-3.5" />
                            </Button>
                        </div>
                    </Card>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

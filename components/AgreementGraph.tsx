"use client";

import React, { useMemo } from 'react';
import ReactFlow, {
    Background,
    Controls,
    Node,
    Edge,
    MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import { SynthesisResult, PaperMetadata } from '@/types';

interface AgreementGraphProps {
    synthesisResult: SynthesisResult;
    papers: PaperMetadata[];
}

export function AgreementGraph({ synthesisResult, papers }: AgreementGraphProps) {
    const { nodes, edges } = useMemo(() => {
        // 1. Create Nodes (Papers)
        const initialNodes: Node[] = papers.map((paper, index) => {
            // Calculate position in a circle
            const angle = (index / papers.length) * 2 * Math.PI;
            const radius = 200;
            return {
                id: paper.paper_id,
                data: { label: paper.title.substring(0, 30) + (paper.title.length > 30 ? "..." : "") },
                position: { x: 400 + radius * Math.cos(angle), y: 300 + radius * Math.sin(angle) },
                style: {
                    background: '#151520',
                    color: '#f8fafc',
                    border: '2px solid #3b82f6',
                    borderRadius: '12px',
                    padding: '10px',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    width: 120,
                    textAlign: 'center'
                },
            };
        });

        // 2. Create Edges (Relationships)
        const initialEdges: Edge[] = [];

        // Agreement Edges
        synthesisResult.agreed_findings.forEach((finding, fIndex) => {
            const paperIds = finding.supporting_papers;
            // Connect all papers in the group
            for (let i = 0; i < paperIds.length; i++) {
                for (let j = i + 1; j < paperIds.length; j++) {
                    const id = `agreement-${fIndex}-${i}-${j}`;
                    // Avoid duplicate edges between same papers if possible
                    initialEdges.push({
                        id,
                        source: paperIds[i],
                        target: paperIds[j],
                        label: 'Agrees',
                        style: { stroke: '#10b981', strokeWidth: 3 },
                        labelStyle: { fill: '#10b981', fontSize: 8, fontWeight: 'bold' },
                        animated: true
                    });
                }
            }
        });

        // Contradiction Edges
        synthesisResult.contradictions.forEach((contradiction, cIndex) => {
            initialEdges.push({
                id: `contradiction-${cIndex}`,
                source: contradiction.paper_a_claim.paper_id,
                target: contradiction.paper_b_claim.paper_id,
                label: 'Contradicts!',
                style: { stroke: '#ef4444', strokeWidth: 3, strokeDasharray: '5,5' },
                labelStyle: { fill: '#ef4444', fontSize: 8, fontWeight: 'bold' },
                markerEnd: {
                    type: MarkerType.ArrowClosed,
                    color: '#ef4444',
                },
            });
        });

        return { nodes: initialNodes, edges: initialEdges };
    }, [synthesisResult, papers]);

    return (
        <div style={{ width: '100%', height: '100%', minHeight: '500px' }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                fitView
                className="bg-[#0a0a0f]"
                proOptions={{ hideAttribution: true }}
            >
                <Background color="#1e293b" gap={20} />
                <Controls />
            </ReactFlow>

            {/* Legend */}
            <div className="absolute bottom-4 left-4 flex flex-col gap-2 bg-[#0a0a0f]/80 p-3 rounded-lg border border-slate-800 backdrop-blur-sm z-10">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-0.5 bg-agreement"></div>
                    <span className="text-[10px] text-slate-400">Strong Agreement</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-0.5 bg-contradiction border-b border-dashed"></div>
                    <span className="text-[10px] text-slate-400">Direct Contradiction</span>
                </div>
            </div>
        </div>
    );
}

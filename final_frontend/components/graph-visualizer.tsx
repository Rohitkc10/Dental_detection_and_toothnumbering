'use client';

import { GraphEdge, GraphNode } from '@/lib/utils';
import { useEffect, useRef } from 'react';
import { Network } from 'vis-network/standalone';

export interface GraphVisualizerProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export default function GraphVisualizer({
  nodes,
  edges
}: GraphVisualizerProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const network = new Network(
      ref.current,
      {
        nodes,
        edges: edges.map(e => ({
          from: e.from,
          to: e.to,
          label: (e.weight * 100).toFixed(1) + '%',
          width: Math.max(1, e.weight * 5)
        }))
      },
      {
        nodes: {
          shape: 'dot',
          size: 20,
          font: { color: '#fff' }
        },
        groups: {
          tooth: { color: '#38bdf8' },
          disease: { color: '#f87171' }
        },
        physics: {
          stabilization: true
        }
      }
    );

    return () => network.destroy();
  }, [nodes, edges]);

  return (
    <div
      ref={ref}
      className="w-full h-[400px] border rounded-lg bg-slate-900"
    />
  );
}

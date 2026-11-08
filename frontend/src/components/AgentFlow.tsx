import React, { useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MarkerType,
  Position,
  Handle,
} from '@xyflow/react';
import type { Edge, Node } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  Brain,
  Globe2,
  FileSearch,
  LineChart,
  ShieldCheck,
  FileText,
  RotateCw,
} from 'lucide-react';
import type { AgentState } from '../types';

interface AgentFlowProps {
  agents: AgentState[];
  currentAgentId?: string;
}

const AGENT_META: Record<string, { icon: React.ReactNode; color: string; desc: string }> = {
  planner: {
    icon: <Brain className="w-5 h-5 text-indigo-400" />,
    color: 'border-indigo-500/50 shadow-indigo-500/10',
    desc: 'Query Deconstruction & Search Planning',
  },
  research: {
    icon: <Globe2 className="w-5 h-5 text-blue-400" />,
    color: 'border-blue-500/50 shadow-blue-500/10',
    desc: 'Multi-Source Retrieval (Web, arXiv, S2)',
  },
  extraction: {
    icon: <FileSearch className="w-5 h-5 text-cyan-400" />,
    color: 'border-cyan-500/50 shadow-cyan-500/10',
    desc: 'Fact, Metric & Methodology Extraction',
  },
  analysis: {
    icon: <LineChart className="w-5 h-5 text-purple-400" />,
    color: 'border-purple-500/50 shadow-purple-500/10',
    desc: 'Cross-Source Synthesis & Gap Discovery',
  },
  verification: {
    icon: <ShieldCheck className="w-5 h-5 text-amber-400" />,
    color: 'border-amber-500/50 shadow-amber-500/10',
    desc: 'Citation Grounding & Cyclic Audit Loop',
  },
  report: {
    icon: <FileText className="w-5 h-5 text-emerald-400" />,
    color: 'border-emerald-500/50 shadow-emerald-500/10',
    desc: '12-Section Publication Report & PDF',
  },
};

const CustomAgentNode = ({ data }: { data: any }) => {
  const meta = AGENT_META[data.id] || {
    icon: <Brain className="w-5 h-5 text-slate-400" />,
    color: 'border-slate-700',
    desc: data.role || 'Agent Node',
  };

  const isRunning = data.status === 'running';
  const isCompleted = data.status === 'completed';
  const isRetry = data.status === 'retry';

  let borderGlow = 'border-slate-800 bg-slate-900/90';
  let badgeColor = 'bg-slate-800 text-slate-400 border-slate-700';

  if (isRunning) {
    borderGlow = 'border-blue-500 bg-blue-950/40 shadow-lg shadow-blue-500/20 ring-2 ring-blue-500/40 animate-pulse';
    badgeColor = 'bg-blue-950 text-blue-300 border-blue-700';
  } else if (isCompleted) {
    borderGlow = 'border-emerald-500/60 bg-emerald-950/20 shadow-sm shadow-emerald-500/10';
    badgeColor = 'bg-emerald-950 text-emerald-300 border-emerald-700';
  } else if (isRetry) {
    borderGlow = 'border-amber-500/80 bg-amber-950/30 ring-1 ring-amber-500';
    badgeColor = 'bg-amber-950 text-amber-300 border-amber-700';
  }

  return (
    <div
      className={`relative min-w-[220px] max-w-[240px] rounded-xl border p-3.5 backdrop-blur-md transition-all duration-300 ${borderGlow}`}
    >
      <Handle type="target" position={Position.Top} className="!bg-slate-500 !w-2 !h-2" />

      <div className="flex items-center justify-between mb-2">
        <div className="p-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60">
          {meta.icon}
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${badgeColor}`}>
          {isRunning ? (
            <span className="flex items-center">
              <RotateCw className="w-2.5 h-2.5 mr-1 animate-spin" />
              Active
            </span>
          ) : (
            data.status
          )}
        </span>
      </div>

      <h4 className="text-xs font-semibold text-slate-100 truncate">{data.name}</h4>
      <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2 leading-tight">{meta.desc}</p>

      {data.retry_count > 0 && (
        <div className="mt-2 pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-amber-400">
          <span>Verification Feedback</span>
          <span className="font-mono font-bold">Retry #{data.retry_count}</span>
        </div>
      )}

      <Handle type="source" position={Position.Bottom} className="!bg-slate-500 !w-2 !h-2" />
    </div>
  );
};

export const AgentFlow: React.FC<AgentFlowProps> = ({ agents }) => {
  const nodeTypes = useMemo(() => ({ agentNode: CustomAgentNode }), []);

  // Compute flow nodes arranged in two rows for clean topology
  const nodes: Node[] = useMemo(() => {
    const layout = [
      { id: 'planner', x: 50, y: 30 },
      { id: 'research', x: 340, y: 30 },
      { id: 'extraction', x: 630, y: 30 },
      { id: 'analysis', x: 630, y: 220 },
      { id: 'verification', x: 340, y: 220 },
      { id: 'report', x: 50, y: 220 },
    ];

    return layout.map((pos) => {
      const agent = agents.find((a) => a.id === pos.id) || {
        id: pos.id,
        name: pos.id.toUpperCase(),
        role: '',
        status: 'idle',
        retry_count: 0,
      };

      return {
        id: pos.id,
        type: 'agentNode',
        position: { x: pos.x, y: pos.y },
        data: agent,
      };
    });
  }, [agents]);

  // Edges connecting the agents with verification feedback loop
  const edges: Edge[] = useMemo(() => {
    return [
      {
        id: 'e-planner-research',
        source: 'planner',
        target: 'research',
        animated: true,
        style: { stroke: '#6366f1', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#6366f1' },
      },
      {
        id: 'e-research-extraction',
        source: 'research',
        target: 'extraction',
        animated: true,
        style: { stroke: '#3b82f6', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' },
      },
      {
        id: 'e-extraction-analysis',
        source: 'extraction',
        target: 'analysis',
        animated: true,
        style: { stroke: '#06b6d4', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#06b6d4' },
      },
      {
        id: 'e-analysis-verification',
        source: 'analysis',
        target: 'verification',
        animated: true,
        style: { stroke: '#a855f7', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#a855f7' },
      },
      {
        id: 'e-verification-report',
        source: 'verification',
        target: 'report',
        animated: true,
        label: 'Passed',
        labelStyle: { fill: '#10b981', fontSize: 10, fontWeight: 700 },
        style: { stroke: '#10b981', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#10b981' },
      },
      {
        id: 'e-verification-retry-research',
        source: 'verification',
        target: 'research',
        animated: true,
        label: 'Retry Loop (Unsupported)',
        labelStyle: { fill: '#f59e0b', fontSize: 10, fontWeight: 700 },
        style: { stroke: '#f59e0b', strokeWidth: 2, strokeDasharray: '5,5' },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#f59e0b' },
      },
    ];
  }, []);

  return (
    <div className="w-full h-[400px] rounded-xl border border-slate-800 bg-slate-950/70 overflow-hidden relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#1e293b" gap={16} size={1} />
        <Controls className="!bg-slate-900 !border-slate-800 !fill-slate-300" />
      </ReactFlow>
    </div>
  );
};

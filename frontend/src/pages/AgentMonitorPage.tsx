import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Cpu,
  RotateCw,
  Terminal,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import { AgentFlow } from '../components/AgentFlow';
import { StatusBadge } from '../components/StatusBadge';
import { agentsApi, researchApi } from '../services/api';
import { NexusWebSocketClient } from '../services/websocket';
import type { AgentLog, AgentState, ResearchProject } from '../types';

export const AgentMonitorPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const projectIdFromUrl = searchParams.get('id');

  const [projects, setProjects] = useState<ResearchProject[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projectIdFromUrl || '');
  const [currentProject, setCurrentProject] = useState<ResearchProject | null>(null);
  const [agentStates, setAgentStates] = useState<AgentState[]>([]);
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const [activeTaskDesc, setActiveTaskDesc] = useState<string>('Initializing multi-agent workflow...');
  const [retryWarning, setRetryWarning] = useState<string | null>(null);

  const wsClientRef = useRef<NexusWebSocketClient | null>(null);

  // Load project list
  useEffect(() => {
    researchApi.list().then((res) => {
      setProjects(res);
      if (!selectedProjectId && res.length > 0) {
        setSelectedProjectId(res[0].id);
      }
    });
  }, []);

  // Sync selected project data & WebSocket
  useEffect(() => {
    if (!selectedProjectId) return;

    let isMounted = true;

    // Load initial states
    const loadProjectData = async () => {
      try {
        const [proj, agents, projLogs] = await Promise.all([
          researchApi.get(selectedProjectId),
          agentsApi.getStates(selectedProjectId),
          agentsApi.getLogs(selectedProjectId),
        ]);
        if (!isMounted) return;
        setCurrentProject(proj);
        setAgentStates(agents);
        setLogs(projLogs);

        if (proj.status === 'completed') {
          setActiveTaskDesc('Workflow successfully completed. Full 12-section report generated.');
        } else if (proj.status === 'in_progress') {
          setActiveTaskDesc('Autonomous agents coordinating research queries and verification...');
        }
      } catch (e) {
        console.error('Error fetching project data:', e);
      }
    };

    loadProjectData();

    // Connect WebSocket
    wsClientRef.current?.close();
    const ws = new NexusWebSocketClient(selectedProjectId);
    wsClientRef.current = ws;

    ws.subscribe((event, data) => {
      console.log('WS Event received:', event, data);

      setLogs((prev) => [
        ...prev,
        {
          timestamp: new Date().toISOString(),
          agent: event.split('.')[0].toUpperCase() + ' AGENT',
          event,
          message: data.message || `Event: ${event}`,
        },
      ]);

      if (event === 'research.started') {
        setActiveTaskDesc('Research Agent querying web, arXiv, Semantic Scholar, and Crossref...');
      } else if (event === 'research.completed') {
        setActiveTaskDesc(`Research Agent collected ${data.sources_count} deduplicated sources.`);
      } else if (event === 'extraction.started') {
        setActiveTaskDesc('Information Extraction Agent isolating facts and metrics...');
      } else if (event === 'analysis.started') {
        setActiveTaskDesc('Analysis Agent comparing research methodologies and discovering gaps...');
      } else if (event === 'verification.started') {
        setActiveTaskDesc('Verification Agent auditing claim-to-source citation alignment...');
      } else if (event === 'verification.failed') {
        setRetryWarning(`Citation audit flagged unsupported claims. Feedback loop triggered (Retry #${data.retry_count || 1}).`);
        setActiveTaskDesc('Feedback loop active: Retrying targeted research to verify claims...');
      } else if (event === 'verification.passed') {
        setRetryWarning(null);
        setActiveTaskDesc('All research claims verified against cited sources.');
      } else if (event === 'report.generating') {
        setActiveTaskDesc('Report Generation Agent compiling 12 publication sections & PDF...');
      } else if (event === 'report.completed') {
        setActiveTaskDesc('Report generated and publication PDF compiled.');
        loadProjectData();
      }

      // Refresh agent states
      agentsApi.getStates(selectedProjectId).then(setAgentStates).catch(console.warn);
    });

    return () => {
      isMounted = false;
      ws.close();
    };
  }, [selectedProjectId]);

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
            <Cpu className="w-6 h-6 text-blue-500" />
            <span>Real-Time Agent Monitoring</span>
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Live telemetry, cyclic graph state machine, and citation verification feedback loop.
          </p>
        </div>

        {/* Project Selector */}
        {projects.length > 0 && (
          <div className="flex items-center space-x-3 self-start sm:self-auto">
            <span className="text-xs text-slate-400 font-medium">Project:</span>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 focus:border-blue-500 focus:outline-none"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {currentProject && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <span className="text-slate-400">Target Inquiry: </span>
            <span className="text-slate-200 font-semibold">{currentProject.research_question}</span>
          </div>
          <div className="flex items-center space-x-3 shrink-0">
            <StatusBadge status={currentProject.status} />
            {currentProject.status === 'completed' && (
              <Link
                to={`/results?id=${currentProject.id}`}
                className="inline-flex items-center space-x-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow hover:bg-emerald-500 transition-colors"
              >
                <span>View Results</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Verification Retry Banner */}
      {retryWarning && (
        <div className="rounded-xl border border-amber-600/60 bg-amber-950/40 p-4 flex items-center space-x-3 text-xs text-amber-300 animate-pulse">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          <div className="flex-1 font-medium">{retryWarning}</div>
          <span className="text-[10px] uppercase font-bold tracking-wider bg-amber-900/80 px-2.5 py-1 rounded-full border border-amber-700">
            Feedback Retry
          </span>
        </div>
      )}

      {/* Active Task Status Bar */}
      <div className="rounded-xl border border-blue-900/40 bg-blue-950/20 p-3.5 flex items-center space-x-3 text-xs text-blue-200">
        <RotateCw className="w-4 h-4 text-blue-400 animate-spin shrink-0" />
        <span className="text-slate-400">Current Phase:</span>
        <span className="font-semibold text-white">{activeTaskDesc}</span>
      </div>

      {/* React Flow Topology Visualizer */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
          <span>Agent Topology & State Graph</span>
          <span className="text-[11px] text-slate-500">Auto-routes on Verification Status</span>
        </div>
        <AgentFlow agents={agentStates} />
      </div>

      {/* Real-Time Terminal Event Log */}
      <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5 text-xs">
          <div className="flex items-center space-x-2 text-slate-300 font-semibold font-mono">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span>Agent Execution Log Feed (WebSocket Telemetry)</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">
            {logs.length} Total Events
          </span>
        </div>

        <div className="max-h-56 overflow-y-auto space-y-1.5 font-mono text-xs pr-2">
          {logs.length === 0 ? (
            <div className="text-slate-600 italic py-4 text-center">Listening for real-time agent events...</div>
          ) : (
            logs.map((log, i) => (
              <div key={i} className="flex items-start space-x-2.5 py-1 text-slate-300 hover:bg-slate-900/40 px-1 rounded">
                <span className="text-slate-600 shrink-0 text-[10px]">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
                <span className="text-indigo-400 font-semibold shrink-0">[{log.agent}]</span>
                <span className="text-slate-200">{log.message}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Sparkles,
  Layers,
  BookOpen,
  Sliders,
  CheckCircle2,
  FileCheck,
  Edit3,
  XCircle,
  Play,
  RotateCw,
  FolderGit2,
} from 'lucide-react';
import { documentsApi, researchApi } from '../services/api';
import type { DocumentItem, ResearchPlan, ResearchProject } from '../types';

export const NewResearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Form State
  const [question, setQuestion] = useState(searchParams.get('q') || '');
  const [mode, setMode] = useState('deep');
  const [depth, setDepth] = useState('standard');
  const [maxSources, setMaxSources] = useState(10);
  const [includeAcademic, setIncludeAcademic] = useState(true);
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [availableDocs, setAvailableDocs] = useState<DocumentItem[]>([]);

  // Execution & Approval State
  const [planning, setPlanning] = useState(false);
  const [activeProject, setActiveProject] = useState<ResearchProject | null>(null);
  const [humanFeedback, setHumanFeedback] = useState('');
  const [approving, setApproving] = useState(false);

  useEffect(() => {
    // Load available PDF documents for optional RAG injection
    documentsApi.list().then(setAvailableDocs).catch(console.warn);
  }, []);

  const handleStartPlanning = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setPlanning(true);
    try {
      const project = await researchApi.create({
        research_question: question,
        mode,
        depth,
        max_sources: maxSources,
        include_academic: includeAcademic,
        selected_document_ids: selectedDocs,
      });
      setActiveProject(project);
    } catch (err) {
      console.error('Error starting research plan:', err);
    } finally {
      setPlanning(false);
    }
  };

  const handleApprovePlan = async (approved: boolean) => {
    if (!activeProject) return;
    setApproving(true);
    try {
      await researchApi.approvePlan(activeProject.id, {
        approved,
        feedback: humanFeedback || undefined,
      });
      if (approved) {
        navigate(`/agents?id=${activeProject.id}`);
      } else {
        setActiveProject(null);
      }
    } catch (err) {
      console.error('Error approving plan:', err);
    } finally {
      setApproving(false);
    }
  };

  const toggleDocSelection = (docId: string) => {
    setSelectedDocs((prev) =>
      prev.includes(docId) ? prev.filter((id) => id !== docId) : [...prev, docId]
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          New Research Workspace
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-400">
          Define your inquiry, select target sources, and review the autonomous research strategy.
        </p>
      </div>

      {/* Step 1: Research Parameter Form */}
      {!activeProject ? (
        <form onSubmit={handleStartPlanning} className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md space-y-5">
            {/* Inquiry Textarea */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Research Inquiry or Hypothesis
              </label>
              <textarea
                required
                rows={4}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="e.g. Conduct a comprehensive comparative study of 5 recent multi-agent frameworks (LangGraph, AutoGen, CrewAI, MetaGPT, ChatDev), benchmark their accuracy, isolate architectural bottlenecks, and identify open research gaps."
                className="w-full rounded-xl border border-slate-700 bg-slate-950/80 p-3.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 leading-relaxed"
              />
            </div>

            {/* Mode & Depth Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  Research Mode
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'quick', label: 'Quick', desc: 'Fast synthesis' },
                    { id: 'deep', label: 'Deep', desc: 'Full citations' },
                    { id: 'academic', label: 'Academic', desc: 'Peer-reviewed' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMode(m.id)}
                      className={`p-2.5 rounded-lg border text-left transition-all ${
                        mode === m.id
                          ? 'border-blue-500 bg-blue-950/40 text-blue-300'
                          : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="text-xs font-semibold">{m.label}</div>
                      <div className="text-[10px] text-slate-500">{m.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  Analysis Depth
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'standard', label: 'Standard', desc: 'Core findings' },
                    { id: 'exhaustive', label: 'Exhaustive', desc: 'Deep ablation' },
                  ].map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setDepth(d.id)}
                      className={`p-2.5 rounded-lg border text-left transition-all ${
                        depth === d.id
                          ? 'border-indigo-500 bg-indigo-950/40 text-indigo-300'
                          : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="text-xs font-semibold">{d.label}</div>
                      <div className="text-[10px] text-slate-500">{d.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Slider and Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-3 border-t border-slate-800/80">
              <div>
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  <span>Target Source Volume</span>
                  <span className="font-mono text-blue-400 font-bold">{maxSources} Sources</span>
                </div>
                <input
                  type="range"
                  min={3}
                  max={25}
                  value={maxSources}
                  onChange={(e) => setMaxSources(Number(e.target.value))}
                  className="w-full accent-blue-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-800 bg-slate-950/60">
                <div>
                  <div className="text-xs font-semibold text-slate-200">Include Academic Registries</div>
                  <div className="text-[11px] text-slate-400">Query arXiv, Semantic Scholar, and Crossref</div>
                </div>
                <input
                  type="checkbox"
                  checked={includeAcademic}
                  onChange={(e) => setIncludeAcademic(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 bg-slate-900 border-slate-700"
                />
              </div>
            </div>

            {/* RAG Document Selector */}
            {availableDocs.length > 0 && (
              <div className="pt-3 border-t border-slate-800/80">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  Attach Uploaded Documents (RAG)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
                  {availableDocs.map((doc) => (
                    <div
                      key={doc.id}
                      onClick={() => toggleDocSelection(doc.id)}
                      className={`flex items-center space-x-2.5 p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                        selectedDocs.includes(doc.id)
                          ? 'border-blue-500 bg-blue-950/40 text-blue-300'
                          : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <FolderGit2 className="w-4 h-4 shrink-0 text-slate-500" />
                      <span className="truncate flex-1">{doc.original_name}</span>
                      <span className="text-[10px] text-slate-500">{doc.page_count}p</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={planning}
            className="w-full inline-flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3.5 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 hover:from-blue-500 hover:to-indigo-500 transition-all disabled:opacity-50"
          >
            {planning ? (
              <>
                <RotateCw className="w-4 h-4 animate-spin" />
                <span>Planner Agent Analyzing Domain & Formulation...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Autonomous Research Plan</span>
              </>
            )}
          </button>
        </form>
      ) : (
        /* Step 2: Human-in-the-Loop Plan Review & Approval Checkpoint */
        <div className="space-y-6">
          <div className="rounded-2xl border border-indigo-500/40 bg-slate-900/90 p-6 backdrop-blur-md space-y-6 shadow-xl shadow-indigo-500/10">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-2 text-indigo-400 font-semibold text-sm">
                <FileCheck className="w-5 h-5" />
                <span>Human-in-the-Loop: Review Proposed Research Plan</span>
              </div>
              <span className="text-xs bg-indigo-950 text-indigo-300 px-2.5 py-1 rounded-full border border-indigo-800">
                Complexity: {activeProject.plan?.complexity || 'Medium'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-xl border border-slate-800 bg-slate-950/60">
                <span className="text-slate-500 uppercase font-bold text-[10px] block mb-1">Identified Domain</span>
                <span className="text-slate-200 font-medium">{activeProject.plan?.domain}</span>
              </div>
              <div className="p-3 rounded-xl border border-slate-800 bg-slate-950/60">
                <span className="text-slate-500 uppercase font-bold text-[10px] block mb-1">Generated Queries</span>
                <span className="text-slate-200 font-medium">{activeProject.plan?.search_queries.length} Targeted API Searches</span>
              </div>
            </div>

            {/* Objectives */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">Core Objectives</h4>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {activeProject.plan?.objectives.map((obj, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Subtasks */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">Decomposed Subtasks</h4>
              <div className="space-y-2">
                {activeProject.plan?.subtasks.map((task, i) => (
                  <div key={i} className="p-3 rounded-lg border border-slate-800/80 bg-slate-950/50 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-slate-200">{task.title}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{task.description}</div>
                    </div>
                    <span className="text-[10px] font-mono text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800/50">
                      Priority {task.priority}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Strategy */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">Autonomous Strategy</h4>
              <p className="text-xs text-slate-400 leading-relaxed bg-slate-950/40 p-3 rounded-lg border border-slate-800/60">
                {activeProject.plan?.strategy}
              </p>
            </div>

            {/* Human Feedback Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Optional Guidance or Refinements for Swarm Execution
              </label>
              <input
                type="text"
                value={humanFeedback}
                onChange={(e) => setHumanFeedback(e.target.value)}
                placeholder="e.g. Focus specifically on papers published between 2024 and 2026..."
                className="w-full rounded-lg border border-slate-700 bg-slate-950/80 py-2 px-3 text-xs text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => handleApprovePlan(false)}
                className="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-rose-400 transition-colors"
              >
                <XCircle className="w-4 h-4" />
                <span>Reject & Cancel</span>
              </button>

              <button
                type="button"
                disabled={approving}
                onClick={() => handleApprovePlan(true)}
                className="inline-flex items-center space-x-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-500 transition-all disabled:opacity-50"
              >
                {approving ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin" />
                    <span>Launching Multi-Agent Swarm...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>Approve & Launch Research Swarm</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

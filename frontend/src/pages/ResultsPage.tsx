import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  FileCheck2,
  FileText,
  Search,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Cpu,
  Download,
} from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';
import { reportsApi, researchApi } from '../services/api';
import type { ResearchProject } from '../types';

export const ResultsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const projectIdFromUrl = searchParams.get('id');

  const [projects, setProjects] = useState<ResearchProject[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projectIdFromUrl || '');
  const [project, setProject] = useState<ResearchProject | null>(null);
  const [activeTab, setActiveTab] = useState<'summary' | 'findings' | 'sources' | 'analysis' | 'verification'>('summary');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    researchApi.list().then((list) => {
      setProjects(list);
      if (!selectedProjectId && list.length > 0) {
        setSelectedProjectId(list[0].id);
      }
    });
  }, []);

  useEffect(() => {
    if (!selectedProjectId) return;
    setLoading(true);
    researchApi
      .get(selectedProjectId)
      .then(setProject)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedProjectId]);

  if (loading && !project) {
    return <div className="p-12 text-center text-xs text-slate-500">Loading research findings...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header and Project Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
            <FileCheck2 className="w-6 h-6 text-emerald-400" />
            <span>Research Results & Synthesis</span>
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Multi-agent intelligence synthesis, verified citations, and discovered research gaps.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {projects.length > 0 && (
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
          )}

          {project?.report && (
            <Link
              to={`/reports?id=${project.report.id}`}
              className="inline-flex items-center space-x-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow hover:bg-blue-500 transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Full 12-Section Report</span>
            </Link>
          )}
        </div>
      </div>

      {project && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <span className="text-slate-400">Research Question: </span>
            <span className="text-slate-200 font-semibold">{project.research_question}</span>
          </div>
          <StatusBadge status={project.status} />
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-800 space-x-2 overflow-x-auto pb-1">
        {[
          { id: 'summary', label: 'Executive Summary', icon: FileText },
          { id: 'findings', label: `Verified Findings (${project?.findings?.length || 0})`, icon: CheckCircle2 },
          { id: 'sources', label: `Sources (${project?.sources?.length || 0})`, icon: BookOpen },
          { id: 'analysis', label: 'Analysis & Research Gaps', icon: TrendingUp },
          { id: 'verification', label: `Citation Audit (${project?.verification_results?.length || 0})`, icon: AlertTriangle },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-3.5 py-2 text-xs font-medium border-b-2 whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {/* TAB 1: Executive Summary */}
        {activeTab === 'summary' && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 space-y-6">
            <div>
              <h3 className="text-base font-bold text-white mb-2">Executive Summary</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                {project?.report?.executive_summary ||
                  'Executive summary compiling across gathered academic sources...'}
              </p>
            </div>

            {project?.plan && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/50">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Research Objectives
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {project.plan.objectives.map((obj, i) => (
                      <li key={i} className="flex items-start space-x-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/50">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Methodological Deconstruction
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Domain classified under <b>{project.plan.domain}</b> with <b>{project.plan.complexity}</b> complexity.
                    Executed {project.plan.subtasks.length} phased subtasks with strict citation attribution.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Verified Findings */}
        {activeTab === 'findings' && (
          <div className="space-y-3">
            {(!project?.findings || project.findings.length === 0) ? (
              <div className="p-8 text-center text-xs text-slate-500">No findings extracted yet.</div>
            ) : (
              project.findings.map((finding, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 space-y-2 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200 flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-950 text-blue-300 border border-blue-800">
                        {finding.finding_type}
                      </span>
                      {finding.source_index && (
                        <span className="text-slate-400 font-mono text-[11px]">
                          Ref [Source {finding.source_index}]
                        </span>
                      )}
                    </span>
                    <span className="text-[11px] text-emerald-400 font-mono">
                      {(finding.confidence * 100).toFixed(0)}% Confidence
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-200">{finding.statement}</p>

                  {finding.evidence_quote && (
                    <div className="text-xs text-slate-400 italic bg-slate-950/60 p-2.5 rounded border border-slate-800/80">
                      "{finding.evidence_quote}"
                    </div>
                  )}

                  {finding.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {finding.tags.map((t, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 3: Sources */}
        {activeTab === 'sources' && (
          <div className="space-y-3">
            {(!project?.sources || project.sources.length === 0) ? (
              <div className="p-8 text-center text-xs text-slate-500">No sources indexed yet.</div>
            ) : (
              project.sources.map((src, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 space-y-2 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-100 flex items-center space-x-2">
                      <span className="font-mono text-blue-400 font-bold">[{src.source_index}]</span>
                      <span className="text-xs font-bold">{src.title}</span>
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                      {src.source_type}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">{src.snippet}</p>

                  <div className="flex flex-wrap items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] text-slate-500">
                    <div>
                      {src.authors?.length > 0 && <span>Authors: {src.authors.join(', ')} • </span>}
                      <span>{src.publication_date || 'Recent'}</span>
                    </div>

                    {src.url && (
                      <a
                        href={src.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center text-blue-400 hover:text-blue-300 font-medium"
                      >
                        <span>Direct Reference</span>
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 4: Analysis & Research Gaps */}
        {activeTab === 'analysis' && (
          <div className="space-y-6">
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-purple-400" />
                <span>Cross-Source Comparative Synthesis</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                {project?.report?.sections.find((s) => s.title.includes('Comparative'))?.content ||
                  'Multi-agent comparative analysis...'}
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Cpu className="w-4 h-4 text-amber-400" />
                <span>Identified Research Gaps & Unsolved Challenges</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                {project?.report?.sections.find((s) => s.title.includes('Research Gaps'))?.content ||
                  'No open research gaps identified.'}
              </p>
            </div>
          </div>
        )}

        {/* TAB 5: Citation Verification Audit */}
        {activeTab === 'verification' && (
          <div className="space-y-3">
            {(!project?.verification_results || project.verification_results.length === 0) ? (
              <div className="p-8 text-center text-xs text-slate-500">No verification results recorded yet.</div>
            ) : (
              project.verification_results.map((v, idx) => (
                <div
                  key={idx}
                  className={`rounded-xl border p-4 space-y-2 transition-colors ${
                    v.status === 'verified'
                      ? 'border-emerald-800/60 bg-emerald-950/20'
                      : 'border-amber-800/60 bg-amber-950/20'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200">Claim Audit #{idx + 1}</span>
                    <StatusBadge status={v.status} size="sm" />
                  </div>

                  <p className="text-xs sm:text-sm text-slate-100 font-medium">"{v.claim}"</p>

                  <div className="flex items-center space-x-3 text-[11px] text-slate-400">
                    <span>
                      Supporting Citations:{' '}
                      <b className="text-slate-200 font-mono">
                        {v.supporting_source_indices.length > 0
                          ? v.supporting_source_indices.map((i) => `[${i}]`).join(' ')
                          : 'None'}
                      </b>
                    </span>
                    <span>•</span>
                    <span>Confidence Score: <b className="text-emerald-400">{(v.confidence_score * 100).toFixed(0)}%</b></span>
                  </div>

                  {v.contradiction_details && (
                    <div className="text-xs text-amber-300 bg-amber-950/60 p-2.5 rounded border border-amber-800/60">
                      <b>Auditor Flag</b>: {v.contradiction_details}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

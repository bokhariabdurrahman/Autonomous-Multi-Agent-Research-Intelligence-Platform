import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileText,
  Clock,
  Sparkles,
  ArrowRight,
  Database,
  Cpu,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { MetricCard } from '../components/MetricCard';
import { StatusBadge } from '../components/StatusBadge';
import { analyticsApi, researchApi } from '../services/api';
import type { OverviewStats, ResearchProject, UsageStats } from '../types';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [usage, setUsage] = useState<UsageStats | null>(null);
  const [projects, setProjects] = useState<ResearchProject[]>([]);
  const [quickPrompt, setQuickPrompt] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [overviewRes, usageRes, projectsRes] = await Promise.all([
          analyticsApi.getOverview(),
          analyticsApi.getUsage(),
          researchApi.list(0, 5),
        ]);
        setStats(overviewRes);
        setUsage(usageRes);
        setProjects(projectsRes);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickPrompt.trim()) return;
    navigate(`/new-research?q=${encodeURIComponent(quickPrompt)}`);
  };

  return (
    <div className="space-y-8">
      {/* Header & Quick Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Research Intelligence Console
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Autonomous multi-agent orchestration, literature discovery, and citation verification.
          </p>
        </div>
        <Link
          to="/new-research"
          className="inline-flex items-center space-x-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-indigo-500/20 hover:from-blue-500 hover:to-indigo-500 transition-all self-start md:self-auto"
        >
          <Sparkles className="w-4 h-4" />
          <span>New Autonomous Project</span>
        </Link>
      </div>

      {/* Quick Launch Search Bar */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 sm:p-5 backdrop-blur-md">
        <form onSubmit={handleQuickSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Sparkles className="absolute left-3.5 top-3 h-4 w-4 text-blue-400" />
            <input
              type="text"
              value={quickPrompt}
              onChange={(e) => setQuickPrompt(e.target.value)}
              placeholder="e.g. Compare recent Agentic AI architectures, extract limitations, and analyze research gaps..."
              className="w-full rounded-xl border border-slate-700 bg-slate-950/80 py-2.5 pl-10 pr-4 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="inline-flex items-center justify-center space-x-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors"
          >
            <span>Investigate</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Projects"
          value={stats?.total_projects ?? 0}
          subtitle="Formulated by Planner"
          icon={<Cpu className="w-4 h-4 text-blue-400" />}
        />
        <MetricCard
          title="Completed Reports"
          value={stats?.completed_reports ?? 0}
          subtitle="12-section syntheses"
          icon={<FileText className="w-4 h-4 text-emerald-400" />}
          trend="+100%"
          trendPositive={true}
        />
        <MetricCard
          title="Sources Analyzed"
          value={stats?.total_sources_analyzed ?? 0}
          subtitle="arXiv, S2, Crossref, Tavily"
          icon={<Database className="w-4 h-4 text-purple-400" />}
        />
        <MetricCard
          title="Citation Grounding"
          value={`${stats?.verification_pass_rate ?? 100}%`}
          subtitle="Verified evidence accuracy"
          icon={<ShieldCheck className="w-4 h-4 text-amber-400" />}
          trend="Audited"
          trendPositive={true}
        />
      </div>

      {/* Telemetry and Usage Bar */}
      {usage && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-300">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Agent Token Consumption & Telemetry</span>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Total Tokens: <b className="text-slate-200">{usage.total_tokens.toLocaleString()}</b> • Est. Cost: <b className="text-emerald-400">${usage.total_cost_usd}</b>
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
            {Object.entries(usage.by_agent).map(([agent, tokens]) => (
              <div key={agent} className="rounded-lg border border-slate-800/80 bg-slate-950/40 p-2.5">
                <div className="text-[10px] text-slate-400 truncate">{agent}</div>
                <div className="text-xs font-mono font-bold text-slate-200 mt-1">{tokens.toLocaleString()} tok</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Research Projects */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
          <h3 className="text-sm font-semibold text-white">Recent Research Projects</h3>
          <Link to="/results" className="text-xs font-medium text-blue-400 hover:text-blue-300">
            View All
          </Link>
        </div>

        {projects.length === 0 ? (
          <div className="p-10 text-center text-xs text-slate-500">
            No research projects initiated yet. Submit a prompt above to launch your first swarm!
          </div>
        ) : (
          <div className="divide-y divide-slate-800/70">
            {projects.map((p) => (
              <div
                key={p.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:px-5 hover:bg-slate-800/30 transition-colors gap-3"
              >
                <div className="space-y-1 max-w-2xl">
                  <Link
                    to={`/agents?id=${p.id}`}
                    className="text-xs sm:text-sm font-medium text-slate-200 hover:text-blue-400 transition-colors line-clamp-1"
                  >
                    {p.title}
                  </Link>
                  <div className="flex items-center space-x-3 text-[11px] text-slate-500">
                    <span className="capitalize">{p.mode} Mode</span>
                    <span>•</span>
                    <span className="capitalize">{p.depth} Depth</span>
                    <span>•</span>
                    <span>{new Date(p.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3 self-end sm:self-auto">
                  <StatusBadge status={p.status} size="sm" />
                  <Link
                    to={
                      p.status === 'completed'
                        ? `/results?id=${p.id}`
                        : `/agents?id=${p.id}`
                    }
                    className="inline-flex items-center space-x-1 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors"
                  >
                    <span>{p.status === 'completed' ? 'Results' : 'Monitor'}</span>
                    <ArrowRight className="w-3 h-3 ml-0.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

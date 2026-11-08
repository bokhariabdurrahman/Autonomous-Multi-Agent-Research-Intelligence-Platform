import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Cpu,
  ShieldCheck,
  FileText,
  Search,
  Database,
  ArrowRight,
  CheckCircle,
  GitBranch,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col">
      {/* Top Bar */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center space-x-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-indigo-500/20">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              NEXUS<span className="text-blue-500 ml-0.5">AI</span>
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              to="/login"
              className="text-xs font-semibold text-slate-300 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/dashboard"
              className="inline-flex items-center space-x-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors"
            >
              <span>Launch Platform</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16 lg:pt-28 lg:pb-24">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(59,130,246,0.15),rgba(255,255,255,0))]"></div>
        <div className="mx-auto max-w-5xl px-6 text-center relative z-10">
          <div className="inline-flex items-center space-x-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400 mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            <span>Autonomous Multi-Agent Intelligence v2.0</span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
            Autonomous Research <br />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
              Engineered for Rigor
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-3xl mx-auto leading-relaxed">
            NEXUS AI orchestrates a swarm of specialized LangGraph agents to deconstruct complex inquiries,
            retrieve peer-reviewed literature across arXiv and Semantic Scholar, rigorously audit citation grounding,
            and compile 12-section publication-ready reports.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/new-research"
              className="inline-flex items-center space-x-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 hover:bg-blue-500 transition-all hover:scale-105"
            >
              <span>Start Autonomous Research</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/dashboard"
              className="inline-flex items-center space-x-2 rounded-xl border border-slate-700 bg-slate-900/80 px-6 py-3.5 text-sm font-semibold text-slate-200 hover:bg-slate-800 transition-all"
            >
              <span>View Live Dashboard</span>
            </Link>
          </div>

          {/* Workflow Steps Preview */}
          <div className="mt-16 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm text-left">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800/80 pb-3">
              <div className="flex items-center space-x-2 text-xs font-semibold text-slate-300">
                <GitBranch className="w-4 h-4 text-blue-400" />
                <span>Cyclic Multi-Agent LangGraph Orchestration</span>
              </div>
              <span className="text-[11px] text-emerald-400 font-mono">Feedback Retry Active</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center">
              {[
                { title: '1. Planner', desc: 'Query Deconstruction' },
                { title: '2. Research', desc: 'arXiv, S2, Crossref, Tavily' },
                { title: '3. Extraction', desc: 'Facts, Stats & Methodology' },
                { title: '4. Analysis', desc: 'Gap & Trend Discovery' },
                { title: '5. Verification', desc: 'Citation Audit Loop' },
                { title: '6. Report', desc: '12-Section PDF Output' },
              ].map((step, idx) => (
                <div key={idx} className="rounded-lg border border-slate-800/90 bg-slate-950/60 p-3">
                  <div className="text-xs font-bold text-slate-200">{step.title}</div>
                  <div className="text-[10px] text-slate-400 mt-1">{step.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-16 border-t border-slate-900 bg-slate-950/40">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Enterprise-Grade Multi-Agent Architecture
            </h2>
            <p className="mt-3 text-sm text-slate-400">
              Zero hallucinated citations. Genuine graph state machines. Complete document RAG.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6">
              <div className="rounded-lg bg-blue-950/60 border border-blue-800/50 p-2.5 w-fit text-blue-400 mb-4">
                <Search className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white">Multi-Registry Scholarly Search</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Autonomous retrieval across arXiv, Semantic Scholar, Crossref, and web tools (Tavily),
                ranking sources by empirical relevance and reliability.
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6">
              <div className="rounded-lg bg-amber-950/60 border border-amber-800/50 p-2.5 w-fit text-amber-400 mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white">Citation Verification Feedback Loop</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Claims undergo strict semantic citation mapping. Unsupported statements trigger an automated
                feedback loop requesting targeted secondary research.
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6">
              <div className="rounded-lg bg-emerald-950/60 border border-emerald-800/50 p-2.5 w-fit text-emerald-400 mb-4">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white">Advanced RAG & PyMuPDF Ingestion</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Upload proprietary research papers. Extracts clean text, computes SentenceTransformers embeddings,
                and executes cosine similarity vector retrieval with Qdrant.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-900 py-8 bg-slate-950">
        <div className="mx-auto max-w-7xl px-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© 2026 NEXUS AI. Autonomous Multi-Agent Intelligence Platform.</p>
          <div className="flex space-x-6 mt-4 sm:mt-0">
            <Link to="/dashboard" className="hover:text-slate-300">Dashboard</Link>
            <a href="http://localhost:8000/docs" target="_blank" rel="noreferrer" className="hover:text-slate-300">
              API Docs
            </a>
            <Link to="/settings" className="hover:text-slate-300">Settings</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};


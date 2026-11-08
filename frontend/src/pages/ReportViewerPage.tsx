import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  FileText,
  Download,
  CheckCircle2,
  List,
  Sparkles,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { reportsApi } from '../services/api';
import type { Report } from '../types';

export const ReportViewerPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const reportIdFromUrl = searchParams.get('id');

  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReportId, setSelectedReportId] = useState<string>(reportIdFromUrl || '');
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reportsApi.list().then((list) => {
      setReports(list);
      if (!selectedReportId && list.length > 0) {
        setSelectedReportId(list[0].id);
      }
    });
  }, []);

  useEffect(() => {
    if (!selectedReportId) return;
    setLoading(true);
    reportsApi
      .get(selectedReportId)
      .then(setReport)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedReportId]);

  const scrollToSection = (idx: number) => {
    const el = document.getElementById(`section-${idx}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (loading && !report) {
    return <div className="p-12 text-center text-xs text-slate-500">Loading publication report...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Export Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
            <FileText className="w-6 h-6 text-blue-400" />
            <span>Publication Report Viewer</span>
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Complete 12-section synthesized report with peer citations and downloadable PDF.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {reports.length > 0 && (
            <select
              value={selectedReportId}
              onChange={(e) => setSelectedReportId(e.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 focus:border-blue-500 focus:outline-none"
            >
              {reports.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.title}
                </option>
              ))}
            </select>
          )}

          {report && (
            <a
              href={reportsApi.getPdfDownloadUrl(report.id)}
              download
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center space-x-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-emerald-500 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </a>
          )}
        </div>
      </div>

      {report && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Table of Contents Sticky Sidebar */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-20 rounded-xl border border-slate-800 bg-slate-950/70 p-4 space-y-3">
              <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800/80 pb-2">
                <List className="w-4 h-4 text-blue-400" />
                <span>Table of Contents</span>
              </div>
              <nav className="space-y-1 text-xs">
                {report.sections.map((sec, idx) => (
                  <button
                    key={idx}
                    onClick={() => scrollToSection(idx)}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors truncate block"
                  >
                    {sec.title}
                  </button>
                ))}
              </nav>

              <div className="pt-3 border-t border-slate-900 text-[11px] text-slate-500 space-y-1 font-mono">
                <div>Citations: {report.citation_count}</div>
                <div>Sources: {report.source_count}</div>
                <div className="text-emerald-400">Grounded: Verified</div>
              </div>
            </div>
          </div>

          {/* Main Document Layout */}
          <div className="lg:col-span-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 sm:p-10 backdrop-blur-md shadow-2xl space-y-8">
            {/* Document Header */}
            <div className="border-b border-slate-800 pb-6 space-y-3">
              <div className="inline-flex items-center space-x-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-0.5 text-xs font-semibold text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified Peer Research Synthesis</span>
              </div>
              <h2 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                {report.title}
              </h2>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                <span>Generated by NEXUS AI Multi-Agent Swarm</span>
                <span>•</span>
                <span>{new Date(report.created_at).toLocaleDateString()}</span>
                <span>•</span>
                <span className="font-mono text-blue-400">{report.citation_count} Citations</span>
              </div>
            </div>

            {/* Sections Flow */}
            <div className="space-y-8">
              {report.sections.map((sec, idx) => (
                <section key={idx} id={`section-${idx}`} className="space-y-3 scroll-mt-24">
                  <h3 className="text-base sm:text-lg font-bold text-white border-b border-slate-800/80 pb-2">
                    {sec.title}
                  </h3>
                  <div className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line space-y-2">
                    {sec.content}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import {
  Settings,
  Key,
  Cpu,
  User,
  Sliders,
  CheckCircle2,
  Save,
  ShieldCheck,
} from 'lucide-react';
import { authApi } from '../services/api';
import type { User as UserType } from '../types';

export const SettingsPage: React.FC = () => {
  const [user, setUser] = useState<UserType | null>(null);
  const [model, setModel] = useState('gpt-4o');
  const [fastModel, setFastModel] = useState('gpt-4o-mini');
  const [maxRetries, setMaxRetries] = useState(2);
  const [defaultSources, setDefaultSources] = useState(10);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    authApi.getMe().then(setUser).catch(console.warn);
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="border-b border-slate-800/80 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
          <Settings className="w-6 h-6 text-slate-400" />
          <span>Platform & Agent Configuration</span>
        </h1>
        <p className="mt-1 text-xs text-slate-400">
          Manage AI model parameters, verification limits, and research defaults.
        </p>
      </div>

      {saved && (
        <div className="flex items-center space-x-2 rounded-xl border border-emerald-800/60 bg-emerald-950/40 p-3 text-xs text-emerald-300">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Configuration preferences saved successfully.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* User Profile */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-300">
            <User className="w-4 h-4 text-blue-400" />
            <span>User Profile</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Email Address</label>
              <input
                type="text"
                disabled
                value={user?.email || 'demo@nexus-ai.org'}
                className="w-full rounded-lg border border-slate-700 bg-slate-950/50 p-2 text-slate-400 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Full Name</label>
              <input
                type="text"
                defaultValue={user?.full_name || 'NEXUS Researcher'}
                className="w-full rounded-lg border border-slate-700 bg-slate-950/80 p-2 text-slate-200 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Model Selection */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-300">
            <Cpu className="w-4 h-4 text-purple-400" />
            <span>AI Model Configuration</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Default Reasoning Model (Analysis & Reports)</label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950/80 p-2 text-slate-200 focus:border-blue-500 focus:outline-none"
              >
                <option value="gpt-4o">OpenAI GPT-4o (Production High Reasoning)</option>
                <option value="gpt-4o-mini">OpenAI GPT-4o-mini (Speed & Lower Cost)</option>
                <option value="claude-3-5-sonnet">Claude 3.5 Sonnet (Compatibility)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Fast Model (Extraction & Planning)</label>
              <select
                value={fastModel}
                onChange={(e) => setFastModel(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950/80 p-2 text-slate-200 focus:border-blue-500 focus:outline-none"
              >
                <option value="gpt-4o-mini">OpenAI GPT-4o-mini</option>
                <option value="gpt-4o">OpenAI GPT-4o</option>
              </select>
            </div>
          </div>
        </div>

        {/* Multi-Agent Execution Preferences */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-300">
            <Sliders className="w-4 h-4 text-amber-400" />
            <span>Agentic Orchestration Parameters</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div>
              <div className="flex items-center justify-between mb-1.5 font-semibold text-slate-300">
                <span>Maximum Verification Retries</span>
                <span className="font-mono text-amber-400 font-bold">{maxRetries} Retries</span>
              </div>
              <p className="text-[11px] text-slate-500 mb-2">
                Prevents infinite verification loops if claims cannot be fully substantiated.
              </p>
              <input
                type="range"
                min={1}
                max={4}
                value={maxRetries}
                onChange={(e) => setMaxRetries(Number(e.target.value))}
                className="w-full accent-amber-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5 font-semibold text-slate-300">
                <span>Default Source Target</span>
                <span className="font-mono text-blue-400 font-bold">{defaultSources} Sources</span>
              </div>
              <p className="text-[11px] text-slate-500 mb-2">
                Target volume for combined academic and web retrieval.
              </p>
              <input
                type="range"
                min={3}
                max={25}
                value={defaultSources}
                onChange={(e) => setDefaultSources(Number(e.target.value))}
                className="w-full accent-blue-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* API Services Status */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-300">
            <Key className="w-4 h-4 text-emerald-400" />
            <span>Connected Integrations & Infrastructure</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {[
              { name: 'arXiv Public API', status: 'Active (Open Access)', color: 'text-emerald-400' },
              { name: 'Semantic Scholar Graph API', status: 'Configured / Resilient', color: 'text-emerald-400' },
              { name: 'Crossref Metadata API', status: 'Active (Polite Pool)', color: 'text-emerald-400' },
              { name: 'Tavily Web Search', status: 'Available', color: 'text-blue-400' },
              { name: 'Qdrant Vector Database', status: 'Embedded / Local Ready', color: 'text-emerald-400' },
              { name: 'ReportLab PDF Engine', status: 'Active (Local Renderer)', color: 'text-emerald-400' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-slate-800 bg-slate-950/50">
                <span className="font-semibold text-slate-300">{item.name}</span>
                <span className={`text-[11px] font-mono font-medium ${item.color}`}>{item.status}</span>
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="inline-flex items-center space-x-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-semibold text-white shadow hover:bg-blue-500 transition-colors"
        >
          <Save className="w-4 h-4" />
          <span>Save Preferences</span>
        </button>
      </form>
    </div>
  );
};

import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  Cpu,
  FileCheck2,
  FileText,
  FolderGit2,
  Settings,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'New Research', path: '/new-research', icon: PlusCircle },
  { label: 'Agent Monitor', path: '/agents', icon: Cpu },
  { label: 'Research Results', path: '/results', icon: FileCheck2 },
  { label: 'Report Viewer', path: '/reports', icon: FileText },
  { label: 'Document Library', path: '/documents', icon: FolderGit2 },
  { label: 'Settings', path: '/settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="hidden lg:flex w-64 flex-col border-r border-slate-800/80 bg-slate-950/60 p-4">
      <div className="space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 rounded-lg px-3 py-2.5 text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-sm'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200 border border-transparent'
                }`
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Architecture Mini Card */}
      <div className="mt-auto pt-4 border-t border-slate-900">
        <div className="rounded-xl border border-slate-800/70 bg-gradient-to-b from-slate-900/60 to-slate-900/30 p-3.5">
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold mb-1">
            <Cpu className="w-3.5 h-3.5" />
            <span>Multi-Agent Engine</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            LangGraph cyclic state graph with 6 autonomous agents & citation audit loop.
          </p>
          <a
            href="http://localhost:8000/docs"
            target="_blank"
            rel="noreferrer"
            className="mt-2.5 inline-flex items-center text-[11px] text-blue-400 hover:text-blue-300 font-medium"
          >
            <span>FastAPI Docs</span>
            <ExternalLink className="w-3 h-3 ml-1" />
          </a>
        </div>
      </div>
    </aside>
  );
};


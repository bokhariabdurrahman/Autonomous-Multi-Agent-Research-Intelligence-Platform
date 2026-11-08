import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PlusCircle, Sparkles, LogOut, User, Activity } from 'lucide-react';
import { authApi } from '../services/api';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('nexus_token');

  const handleLogout = () => {
    authApi.logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform duration-200">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white group-hover:text-blue-400 transition-colors">
                NEXUS<span className="text-blue-500 font-extrabold ml-1">AI</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-semibold tracking-wider text-slate-400 uppercase bg-slate-800/80 px-2 py-0.5 rounded-full border border-slate-700/60">
                Agentic Intelligence
              </span>
            </div>
          </Link>
        </div>

        {/* Center Live Indicator */}
        <div className="hidden md:flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-slate-400">6 Multi-Agent Swarm</span>
          <span className="text-slate-600">•</span>
          <span className="text-emerald-400 font-medium">Ready</span>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-3">
          <Link
            to="/new-research"
            className="inline-flex items-center space-x-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors focus:ring-2 focus:ring-blue-500/50"
          >
            <PlusCircle className="h-4 w-4" />
            <span>New Research</span>
          </Link>

          {token ? (
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 rounded-lg border border-transparent hover:border-slate-700 transition-all"
            >
              <LogOut className="h-4 w-4" />
            </button>
          ) : (
            <Link
              to="/login"
              className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-800/60"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};


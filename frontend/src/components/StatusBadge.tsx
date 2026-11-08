import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, XCircle, RotateCw } from 'lucide-react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const norm = status.toLowerCase();

  let bg = 'bg-slate-800 text-slate-300 border-slate-700';
  let icon = <Clock className="w-3.5 h-3.5 mr-1" />;
  let label = status;

  if (norm === 'completed' || norm === 'indexed' || norm === 'verified') {
    bg = 'bg-emerald-950/70 text-emerald-300 border-emerald-800/80';
    icon = <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-400" />;
    label = norm === 'completed' ? 'Completed' : norm === 'indexed' ? 'Indexed' : 'Verified';
  } else if (norm === 'running' || norm === 'in_progress') {
    bg = 'bg-blue-950/70 text-blue-300 border-blue-800/80 animate-pulse';
    icon = <RotateCw className="w-3.5 h-3.5 mr-1 text-blue-400 animate-spin" />;
    label = 'Executing';
  } else if (norm === 'plan_ready' || norm === 'pending_plan') {
    bg = 'bg-indigo-950/70 text-indigo-300 border-indigo-800/80';
    icon = <Clock className="w-3.5 h-3.5 mr-1 text-indigo-400" />;
    label = norm === 'plan_ready' ? 'Plan Ready' : 'Planning';
  } else if (norm === 'retry' || norm === 'unsupported') {
    bg = 'bg-amber-950/70 text-amber-300 border-amber-800/80';
    icon = <AlertTriangle className="w-3.5 h-3.5 mr-1 text-amber-400" />;
    label = norm === 'retry' ? 'Retrying' : 'Unsupported';
  } else if (norm === 'failed' || norm === 'cancelled' || norm === 'contradicted') {
    bg = 'bg-rose-950/70 text-rose-300 border-rose-800/80';
    icon = <XCircle className="w-3.5 h-3.5 mr-1 text-rose-400" />;
    label = norm === 'failed' ? 'Failed' : norm === 'cancelled' ? 'Cancelled' : 'Contradicted';
  }

  const px = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center font-medium rounded-full border ${bg} ${px}`}>
      {icon}
      {label}
    </span>
  );
};


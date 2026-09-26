import React from 'react';

interface SkeletonProps {
  type?: 'question' | 'editor' | 'timeline' | 'card' | 'generic';
  title?: string;
  subtitle?: string;
}

export default function AthenaLoadingSkeleton({
  type = 'question',
  title = 'Athena AI Processing...',
  subtitle = 'Analyzing semantic context & generating next prompt'
}: SkeletonProps) {
  if (type === 'question') {
    return (
      <div className="w-full bg-slate-900/60 border border-indigo-500/20 rounded-3xl p-6 sm:p-8 backdrop-blur-xl animate-pulse space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 rounded-full bg-indigo-500/80 animate-ping" />
            <div className="h-3 w-32 bg-indigo-500/30 rounded-full" />
          </div>
          <div className="h-5 w-16 bg-slate-800 rounded-full" />
        </div>
        <div className="space-y-3 pt-2">
          <div className="h-6 w-11/12 bg-slate-800/80 rounded-xl" />
          <div className="h-6 w-3/4 bg-slate-800/60 rounded-xl" />
          <div className="h-4 w-1/2 bg-slate-800/40 rounded-xl" />
        </div>
        <div className="pt-2 flex items-center space-x-2 text-xs text-indigo-300 font-medium">
          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
          <span>{title} &mdash; {subtitle}</span>
        </div>
      </div>
    );
  }

  if (type === 'editor') {
    return (
      <div className="w-full h-full min-h-[420px] bg-slate-950/70 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between animate-pulse">
        <div className="flex justify-between items-center pb-4 border-b border-slate-800/60">
          <div className="h-4 w-28 bg-slate-800 rounded-md" />
          <div className="h-7 w-24 bg-slate-800 rounded-lg" />
        </div>
        <div className="space-y-3 py-6">
          <div className="h-4 w-1/3 bg-slate-800/90 rounded" />
          <div className="h-4 w-2/3 bg-slate-800/70 rounded ml-4" />
          <div className="h-4 w-1/2 bg-slate-800/60 rounded ml-4" />
          <div className="h-4 w-4/5 bg-slate-800/70 rounded ml-8" />
          <div className="h-4 w-1/4 bg-slate-800/50 rounded ml-4" />
          <div className="h-4 w-1/6 bg-slate-800/80 rounded" />
        </div>
        <div className="flex justify-end">
          <div className="h-8 w-28 bg-amber-500/20 rounded-full" />
        </div>
      </div>
    );
  }

  if (type === 'timeline') {
    return (
      <div className="w-full space-y-4 p-4 bg-slate-900/50 rounded-2xl border border-white/5 animate-pulse">
        <div className="h-4 w-40 bg-slate-800 rounded" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center space-x-3">
              <div className="w-6 h-6 rounded-full bg-slate-800" />
              <div className="flex-1 h-10 bg-slate-800/50 rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-6 bg-slate-900/60 rounded-3xl border border-white/5 animate-pulse space-y-3">
      <div className="h-5 w-48 bg-slate-800 rounded" />
      <div className="h-16 w-full bg-slate-800/50 rounded-xl" />
    </div>
  );
}

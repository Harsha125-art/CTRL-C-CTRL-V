'use client';

import React, { useState } from 'react';
import InterviewRoom from '@/components/InterviewRoom';
import { ShieldCheck, Sparkles, Code2, Award, Eye, Terminal } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#09090b] text-white selection:bg-indigo-500/30 overflow-x-hidden relative font-sans">
      
      {/* Ambient Animated Background Glows */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-indigo-600/15 rounded-full blur-[140px] animate-pulse mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] bg-emerald-600/10 rounded-full blur-[140px] animate-pulse mix-blend-screen" style={{ animationDelay: '2.5s' }} />
        <div className="absolute top-[40%] right-[10%] w-[30%] h-[30%] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      </div>

      {/* HireRank Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 w-full py-3.5 px-4 md:px-8 bg-[#09090b]/85 backdrop-blur-xl border-b border-white/5 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-700 rounded-xl shadow-lg shadow-indigo-500/25 flex items-center justify-center border border-indigo-400/20">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl md:text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-100 to-indigo-300">
                HireRank
              </h1>
              <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Project Athena
              </span>
            </div>
            <p className="text-slate-400 text-xs font-medium tracking-wide">
              Autonomous Technical Interview Chamber & Proctoring Verification
            </p>
          </div>
        </div>

        {/* Feature Badges */}
        <div className="hidden lg:flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300">
            <Eye className="w-3.5 h-3.5 text-emerald-400" />
            <span>CV Integrity Tracking</span>
          </div>
          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Resume-to-Reality</span>
          </div>
          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300">
            <Code2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Explain-While-You-Build</span>
          </div>
          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>Evidence-First Scoring</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="w-full px-4 md:px-8 pt-24 pb-8 flex flex-col justify-start min-h-screen relative z-10">
        <InterviewRoom />
      </div>
    </main>
  );
}

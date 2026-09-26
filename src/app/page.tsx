'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import SignInGate from '@/components/auth/SignInGate';
import RecruiterPortal from '@/components/recruiter/RecruiterPortal';
import CandidatePortal from '@/components/candidate/CandidatePortal';
import AuthModal from '@/components/auth/AuthModal';
import {
  ShieldCheck,
  RefreshCw,
  LogOut,
  ChevronDown,
  Sparkles,
  Loader2
} from 'lucide-react';

function HireRankContent() {
  const { user, role, switchRole, logout, isInitialized, setIsAuthModalOpen } = useAuth();
  const searchParams = useSearchParams();
  const inviteParam = searchParams.get('invite');

  // Loading state while checking localStorage to prevent layout flashing
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center text-white">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-3" />
        <p className="text-xs text-slate-400 font-mono tracking-widest uppercase">
          Initializing HireRank...
        </p>
      </div>
    );
  }

  // FIRST REQUIREMENT: If not signed in, show the role selection & sign in gate first!
  if (!user) {
    return <SignInGate initialInviteToken={inviteParam} />;
  }

  return (
    <main className="min-h-screen bg-[#09090b] text-white selection:bg-indigo-500/30 overflow-x-hidden relative font-sans">
      {/* Ambient Animated Background Glows */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-indigo-600/15 rounded-full blur-[140px] animate-pulse mix-blend-screen" />
        <div
          className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] bg-emerald-600/10 rounded-full blur-[140px] animate-pulse mix-blend-screen"
          style={{ animationDelay: '2.5s' }}
        />
        <div className="absolute top-[40%] right-[10%] w-[30%] h-[30%] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      </div>

      {/* Global Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 w-full py-3 px-4 md:px-8 bg-[#09090b]/90 backdrop-blur-xl border-b border-white/5 shadow-2xl flex items-center justify-between gap-3">
        {/* Brand & Platform Identity */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-700 rounded-xl shadow-lg shadow-indigo-500/25 flex items-center justify-center border border-indigo-400/20">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl md:text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-100 to-indigo-300">
                HireRank
              </h1>
              <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Enterprise AI
              </span>
            </div>
            <p className="text-slate-400 text-xs font-medium tracking-wide hidden sm:block">
              Technical Interview Simulator & Recruiter Triage System
            </p>
          </div>
        </div>

        {/* Auth & Role Navigation Controls */}
        <div className="flex items-center space-x-3">
          {/* Quick Role Toggle Button */}
          <button
            type="button"
            onClick={() => switchRole(role === 'recruiter' ? 'candidate' : 'recruiter')}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 flex items-center space-x-2 transition-all hover:border-indigo-500/40"
            title="Toggle between Recruiter and Candidate workspace"
          >
            <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden md:inline">Switch to</span>
            <span className="text-indigo-300 font-extrabold capitalize">
              {role === 'recruiter' ? 'Employee' : 'Recruiter'}
            </span>
          </button>

          {/* User Profile Card & Account Switcher */}
          <button
            type="button"
            onClick={() => setIsAuthModalOpen(true)}
            className="flex items-center space-x-2.5 bg-black/50 hover:bg-slate-900 border border-white/10 px-3 py-1.5 rounded-xl transition-all hover:border-white/20"
          >
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black text-white ${
                role === 'recruiter'
                  ? 'bg-gradient-to-br from-indigo-500 to-purple-600'
                  : 'bg-gradient-to-br from-emerald-500 to-teal-600'
              }`}
            >
              {user.avatar || user.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="text-left hidden sm:block">
              <span className="text-xs font-bold text-white block leading-tight">
                {user.name}
              </span>
              <span className="text-[10px] text-slate-400 font-mono capitalize block leading-tight">
                {role === 'recruiter' ? 'Recruiter' : 'Candidate'}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Sign Out Button (Returns directly to the Role Selection Gate) */}
          <button
            type="button"
            onClick={logout}
            className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-white/10 hover:border-rose-500/30 transition-all"
            title="Sign Out / Switch Identity"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Role-Based Content Area */}
      <div className="w-full px-4 md:px-8 pt-24 pb-12 flex flex-col justify-start min-h-screen relative z-10">
        {role === 'recruiter' ? <RecruiterPortal /> : <CandidatePortal />}
      </div>

      {/* Global Authentication / Profile Switcher Modal */}
      <AuthModal />
    </main>
  );
}

export default function Home() {
  return (
    <AuthProvider>
      <Suspense
        fallback={
          <div className="min-h-screen bg-[#09090b] flex items-center justify-center text-white">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          </div>
        }
      >
        <HireRankContent />
      </Suspense>
    </AuthProvider>
  );
}

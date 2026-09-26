'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types/auth';
import { getInvitationByToken } from '@/lib/invitationStore';
import {
  ShieldCheck,
  Users,
  Briefcase,
  GraduationCap,
  Sparkles,
  ArrowRight,
  Mail,
  User,
  Building,
  CheckCircle2,
  Lock,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SignInGateProps {
  initialInviteToken?: string | null;
}

export default function SignInGate({ initialInviteToken }: SignInGateProps) {
  const { setIsAuthModalOpen } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>('candidate');
  const [inviteNotice, setInviteNotice] = useState<string | null>(null);

  useEffect(() => {
    if (initialInviteToken) {
      const inv = getInvitationByToken(initialInviteToken);
      if (inv) {
        setSelectedRole('candidate');
        setInviteNotice(`Invitation detected from ${inv.companyName} for "${inv.jobTitle}"!`);
      }
    }
  }, [initialInviteToken]);



  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center px-4 py-12 relative z-20 font-sans">
      {/* Brand Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center text-center mb-8"
      >
        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-700 rounded-3xl shadow-2xl shadow-indigo-500/30 flex items-center justify-center border border-indigo-400/20 mb-4">
          <ShieldCheck className="w-9 h-9 text-white" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
          Welcome to <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-white to-purple-300">HireRank</span>
        </h1>
        <p className="text-slate-400 text-sm max-w-md mt-2 font-medium">
          Select your portal to begin: evaluate candidate pipelines or complete proctored technical interviews.
        </p>

        {inviteNotice && (
          <div className="mt-4 px-4 py-2 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl flex items-center space-x-2 text-emerald-300 text-xs font-semibold animate-pulse">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{inviteNotice}</span>
          </div>
        )}
      </motion.div>

      {/* Main Choice Matrix */}
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* RECRUITER CARD */}
        <motion.div
          whileHover={{ scale: 1.015 }}
          onClick={() => { setSelectedRole('recruiter'); }}
          className={`cursor-pointer rounded-3xl p-7 transition-all relative overflow-hidden flex flex-col justify-between border ${
            selectedRole === 'recruiter'
              ? 'bg-slate-900/90 border-indigo-500/60 shadow-[0_0_50px_rgba(99,102,241,0.2)] ring-2 ring-indigo-500/30'
              : 'bg-slate-900/50 border-white/5 hover:border-white/15'
          }`}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Briefcase className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                Hiring Teams
              </span>
            </div>

            <div>
              <h2 className="text-2xl font-black text-white">Sign In as Recruiter</h2>
              <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                Upload resumes, configure tailored verification topics, send invitation links to candidates, and review full CV integrity dossiers.
              </p>
            </div>

            <div className="space-y-2 pt-2 text-xs text-slate-300">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                <span>Upload candidate resumes (PDF or Text)</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                <span>Send direct interview invitation links</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                <span>Audit verbatim transcripts & CV integrity markers</span>
              </div>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-white/5 space-y-3">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsAuthModalOpen(true);
              }}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2"
            >
              <span>Open Authentication Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        {/* CANDIDATE CARD */}
        <motion.div
          whileHover={{ scale: 1.015 }}
          onClick={() => { setSelectedRole('candidate'); }}
          className={`cursor-pointer rounded-3xl p-7 transition-all relative overflow-hidden flex flex-col justify-between border ${
            selectedRole === 'candidate'
              ? 'bg-slate-900/90 border-emerald-500/60 shadow-[0_0_50px_rgba(16,185,129,0.2)] ring-2 ring-emerald-500/30'
              : 'bg-slate-900/50 border-white/5 hover:border-white/15'
          }`}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <GraduationCap className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Job Seekers & Employees
              </span>
            </div>

            <div>
              <h2 className="text-2xl font-black text-white">Sign In as Candidate</h2>
              <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                Review your interview invitations, launch real-time technical simulations, and access personalized engineering feedback & growth roadmaps.
              </p>
            </div>

            <div className="space-y-2 pt-2 text-xs text-slate-300">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>View received interview invitations</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Explain-While-You-Build Monaco code chamber</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Personalized readiness & study topics roadmap</span>
              </div>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-white/5 space-y-3">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsAuthModalOpen(true);
              }}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center space-x-2"
            >
              <span>Open Authentication Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>

    </div>
  );
}


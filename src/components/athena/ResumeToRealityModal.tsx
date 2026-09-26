import React from 'react';
import { VerificationTopic } from '@/types/athena';
import { CheckCircle2, ShieldCheck, ArrowRight, Sparkles, BookOpen, Layers } from 'lucide-react';
import { motion } from 'framer-motion';

interface ResumeToRealityModalProps {
  isOpen: boolean;
  projectClaims: string[];
  verificationTopics: VerificationTopic[];
  onConfirmAndStart: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function ResumeToRealityModal({
  isOpen,
  projectClaims,
  verificationTopics,
  onConfirmAndStart,
  onCancel,
  isLoading = false
}: ResumeToRealityModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/85 backdrop-blur-xl px-4 py-8 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-[0_0_80px_rgba(0,0,0,0.8)] flex flex-col space-y-6 relative overflow-hidden"
      >
        {/* Decorative Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-indigo-500 to-purple-500" />

        {/* Modal Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Resume-to-Reality
                </span>
                <span className="text-xs text-slate-400 font-medium">Athena Verification Engine</span>
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight mt-0.5">
                Review Your 3 Verification Topics
              </h2>
            </div>
          </div>
          <p className="text-xs text-slate-400 max-w-xs text-left sm:text-right">
            Athena cross-referenced your resume against the Job Description to curate these core interview probes.
          </p>
        </div>

        {/* Extracted Resume Claims Summary */}
        {projectClaims && projectClaims.length > 0 && (
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 space-y-2">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Extracted Project Claims from Your Resume</span>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              {projectClaims.slice(0, 3).map((claim, idx) => (
                <li
                  key={idx}
                  className="bg-black/40 border border-white/5 rounded-xl p-3 text-xs text-slate-300 leading-relaxed flex items-start space-x-2"
                >
                  <span className="text-indigo-400 font-bold text-xs mt-0.5">#{idx + 1}</span>
                  <span className="line-clamp-3">{claim}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 3 Verification Topics */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-widest text-indigo-400">
              Selected Technical Verification Topics
            </h3>
            <span className="text-[11px] text-slate-500">
              The AI interviewer will focus deep-dive questions on these areas
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {verificationTopics.slice(0, 3).map((topic, index) => (
              <div
                key={topic.id || index}
                className="bg-slate-950/60 border border-slate-800 hover:border-indigo-500/40 rounded-2xl p-4 flex flex-col justify-between transition-all duration-300 group shadow-md"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-black flex items-center justify-center border border-indigo-500/30">
                      {index + 1}
                    </span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-white/5 text-slate-400 border border-white/10">
                      {topic.competency || 'Core Competency'}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white group-hover:text-indigo-200 transition-colors line-clamp-2">
                    {topic.title}
                  </h4>

                  <div className="bg-white/[0.02] border border-white/5 rounded-xl p-2.5 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-emerald-400 block tracking-wider">
                      Resume Anchor
                    </span>
                    <p className="text-xs text-slate-300 line-clamp-2 italic">
                      "{topic.sourceClaim}"
                    </p>
                  </div>

                  <div className="pt-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider mb-1">
                      Probe Objective
                    </span>
                    <p className="text-xs text-slate-400 line-clamp-3">
                      {topic.keyVerificationGoal}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/5 mt-3 flex items-center text-[11px] text-emerald-400/90 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                  <span>Ready for Verification</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-white/10">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-colors"
          >
            Adjust Context
          </button>

          <button
            type="button"
            onClick={onConfirmAndStart}
            disabled={isLoading}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-[0_0_30px_rgba(79,70,229,0.4)] flex items-center group"
          >
            <span>Confirm & Enter Athena Chamber</span>
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}

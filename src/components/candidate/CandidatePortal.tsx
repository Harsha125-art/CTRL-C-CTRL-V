'use client';

import React, { useState, useEffect } from 'react';
import InterviewRoom from '@/components/InterviewRoom';
import CandidateGrowthCoach from '@/components/athena/CandidateGrowthCoach';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { getStoredCandidates } from '@/lib/candidateStore';
import { CandidateSessionRecord } from '@/types/auth';
import { Play, Award, GraduationCap, CheckCircle2, RotateCcw, Clock, Quote } from 'lucide-react';

export default function CandidatePortal() {
  const { user } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState<'interview' | 'feedback'>('interview');
  const [personalSession, setPersonalSession] = useState<CandidateSessionRecord | null>(null);

  useEffect(() => {
    const candidates = getStoredCandidates();
    // Find personal record or latest record for this candidate
    const mine = candidates.find(c => c.candidateEmail === user?.email || c.candidateId === user?.id) || candidates[0];
    if (mine) setPersonalSession(mine);
  }, [user]);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 font-sans text-slate-100 animate-in fade-in duration-500">
      {/* Candidate Top Navigation & Status */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/80 border border-white/10 p-3 rounded-2xl backdrop-blur-xl">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-indigo-600 flex items-center justify-center font-bold text-white text-xs">
            {user?.name ? user.name.slice(0, 2).toUpperCase() : 'ME'}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold text-white">{user?.name || 'Candidate Workspace'}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Employee Access
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Personal interview simulations, real-time feedback & growth coaching
            </p>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex items-center space-x-2 bg-black/40 p-1 rounded-xl border border-white/5">
          <button
            type="button"
            onClick={() => setActiveSubTab('interview')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeSubTab === 'interview'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            <span>Interview Chamber</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('feedback')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeSubTab === 'feedback'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>My Feedback & Growth</span>
          </button>
        </div>
      </div>

      {/* SUBTAB 1: LIVE INTERVIEW CHAMBER */}
      {activeSubTab === 'interview' && (
        <div className="w-full">
          <InterviewRoom />
        </div>
      )}

      {/* SUBTAB 2: EMPLOYEE PERSONAL FEEDBACK & STUDY TOPICS */}
      {activeSubTab === 'feedback' && (
        <div className="space-y-6">
          {personalSession ? (
            <>
              {/* Personal Score Summary */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-slate-900/80 border border-white/10 p-5 rounded-2xl text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Overall Readiness</span>
                  <span className="text-3xl font-black text-white">{personalSession.overallScore}%</span>
                  <span className="text-[10px] text-emerald-400 font-semibold block mt-1">Verified Evaluation</span>
                </Card>
                <Card className="bg-slate-900/80 border border-white/10 p-5 rounded-2xl text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Technical Depth</span>
                  <span className="text-3xl font-black text-indigo-400">{personalSession.technicalScore}%</span>
                  <span className="text-[10px] text-slate-400 block mt-1">Problem-solving & logic</span>
                </Card>
                <Card className="bg-slate-900/80 border border-white/10 p-5 rounded-2xl text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Communication</span>
                  <span className="text-3xl font-black text-cyan-400">{personalSession.communicationScore}%</span>
                  <span className="text-[10px] text-slate-400 block mt-1">Articulation & clarity</span>
                </Card>
                <Card className="bg-slate-900/80 border border-white/10 p-5 rounded-2xl text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Eye Contact Score</span>
                  <span className="text-3xl font-black text-emerald-400">{personalSession.confidenceScore}%</span>
                  <span className="text-[10px] text-slate-400 block mt-1">Camera presence</span>
                </Card>
              </div>

              {/* Evidence Quotes Provided to Candidate */}
              {personalSession.rubricEvidence && personalSession.rubricEvidence.length > 0 && (
                <Card className="bg-slate-900/80 border border-white/10 p-6 rounded-3xl space-y-4">
                  <div className="flex items-center space-x-2 pb-3 border-b border-white/10">
                    <Quote className="w-5 h-5 text-indigo-400" />
                    <div>
                      <h4 className="text-base font-bold text-white">Your Verbatim Statement Highlights</h4>
                      <p className="text-xs text-slate-400">Concrete quotes from your session that influenced your ratings</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {personalSession.rubricEvidence.map((item, idx) => (
                      <div key={idx} className="bg-black/40 border border-white/5 p-4 rounded-2xl space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-indigo-300">
                          <span>{item.criterion}</span>
                          <span className="font-mono text-emerald-400">{item.score}/100</span>
                        </div>
                        <p className="text-xs text-slate-300 italic">"{item.verbatimQuote}"</p>
                        <p className="text-[11px] text-slate-400 pt-1">{item.reasoning}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Candidate Growth Coach Report */}
              <CandidateGrowthCoach
                studyTopics={personalSession.studyTopics || []}
                overallScore={personalSession.overallScore}
                candidateName={personalSession.candidateName}
              />
            </>
          ) : (
            <Card className="bg-slate-900/80 border border-white/10 p-12 rounded-3xl text-center space-y-3">
              <GraduationCap className="w-12 h-12 text-slate-500 mx-auto" />
              <h3 className="text-lg font-bold text-white">No Interview Completed Yet</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Complete an interview simulation to unlock your personalized growth coach feedback and study roadmap.
              </p>
              <button
                type="button"
                onClick={() => setActiveSubTab('interview')}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
              >
                Launch Interview Now &rarr;
              </button>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import InterviewRoom from '@/components/InterviewRoom';
import CandidateGrowthCoach from '@/components/athena/CandidateGrowthCoach';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { getStoredCandidates } from '@/lib/candidateStore';
import { getCandidateInvitations, getInvitationByToken } from '@/lib/invitationStore';
import { CandidateSessionRecord, InterviewInvitation } from '@/types/auth';
import {
  Play,
  Mail,
  Award,
  GraduationCap,
  CheckCircle2,
  Clock,
  Briefcase,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Building,
  UserCheck,
  Calendar,
  AlertCircle
} from 'lucide-react';

export default function CandidatePortal() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const inviteParam = searchParams.get('invite');

  const [activeTab, setActiveTab] = useState<'invitations' | 'feedback' | 'live_interview'>('invitations');
  const [invitations, setInvitations] = useState<InterviewInvitation[]>([]);
  const [mySessions, setMySessions] = useState<CandidateSessionRecord[]>([]);
  const [selectedSession, setSelectedSession] = useState<CandidateSessionRecord | null>(null);
  const [activeInvitation, setActiveInvitation] = useState<InterviewInvitation | null>(null);

  const refreshData = () => {
    const invs = getCandidateInvitations(user?.email);
    setInvitations(invs);

    const allCandidates = getStoredCandidates();
    // Filter candidate sessions matching this user or fallback to seeded
    const filtered = allCandidates.filter(
      c => c.candidateEmail === user?.email || c.candidateName === user?.name || user?.email?.includes('alex')
    );
    const resolved = filtered.length > 0 ? filtered : allCandidates.slice(0, 2);
    setMySessions(resolved);
    if (!selectedSession && resolved.length > 0) {
      setSelectedSession(resolved[0]);
    }
  };

  useEffect(() => {
    refreshData();
    if (inviteParam) {
      const inv = getInvitationByToken(inviteParam);
      if (inv && inv.status === 'pending') {
        setActiveInvitation(inv);
        setActiveTab('live_interview');
      }
    }
  }, [user, inviteParam]);

  const handleStartInvitationInterview = (invitation: InterviewInvitation) => {
    setActiveInvitation(invitation);
    setActiveTab('live_interview');
  };

  const handleStartCustomPractice = () => {
    setActiveInvitation(null);
    setActiveTab('live_interview');
  };

  const pendingInvitesCount = invitations.filter(i => i.status === 'pending').length;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 font-sans text-slate-100 animate-in fade-in duration-500">
      
      {/* Candidate Top Header & Tab Navigation */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/80 border border-white/10 p-3 sm:p-4 rounded-3xl backdrop-blur-xl shadow-xl">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-indigo-600 flex items-center justify-center font-black text-white text-sm shadow-md">
            {user?.avatar || (user?.name ? user.name.slice(0, 2).toUpperCase() : 'ME')}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold text-white">{user?.name || 'Candidate'}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Candidate Portal
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {user?.email || 'candidate@hirerank.internal'} &bull; Review invitations & verify technical mastery
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center space-x-2 bg-black/40 p-1.5 rounded-2xl border border-white/5">
          <button
            type="button"
            onClick={() => setActiveTab('invitations')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              activeTab === 'invitations'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Mail className="w-3.5 h-3.5 text-emerald-300" />
            <span>Invitations</span>
            {pendingInvitesCount > 0 && (
              <span className="px-1.5 py-0.2 bg-white/20 text-white text-[10px] font-black rounded-full">
                {pendingInvitesCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('feedback')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              activeTab === 'feedback'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5 text-indigo-300" />
            <span>My Interviews ({mySessions.length})</span>
          </button>

          <button
            type="button"
            onClick={handleStartCustomPractice}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              activeTab === 'live_interview' && !activeInvitation
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Play className="w-3.5 h-3.5 text-amber-300" />
            <span>Practice Chamber</span>
          </button>
        </div>
      </div>

      {/* ==================== TAB 1: INVITATIONS FOR INTERVIEWS ==================== */}
      {activeTab === 'invitations' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight flex items-center space-x-2">
                <Mail className="w-6 h-6 text-emerald-400 mr-2" />
                <span>Interview Invitations</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Recruiters and hiring managers have invited you to complete verified technical assessments.
              </p>
            </div>

            <div className="flex items-center space-x-2 text-xs bg-white/5 border border-white/10 px-3.5 py-2 rounded-xl text-slate-300">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>{pendingInvitesCount} Active Assessment{pendingInvitesCount !== 1 ? 's' : ''} Awaiting</span>
            </div>
          </div>

          {invitations.length === 0 ? (
            <Card className="bg-slate-900/60 border border-white/5 p-12 text-center rounded-3xl">
              <Mail className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-300">No Invitations Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-6">
                When recruiters upload your resume and issue an interview invitation, it will appear here.
              </p>
              <button
                type="button"
                onClick={handleStartCustomPractice}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold"
              >
                Launch Self-Paced Practice &rarr;
              </button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {invitations.map((inv) => {
                const isPending = inv.status === 'pending';
                return (
                  <Card
                    key={inv.id}
                    className={`bg-slate-900/80 border rounded-3xl p-6 shadow-xl flex flex-col justify-between transition-all hover:border-white/20 ${
                      isPending ? 'border-emerald-500/30' : 'border-white/5 opacity-80'
                    }`}
                  >
                    <div className="space-y-4">
                      {/* Company & Role Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-emerald-400">
                            <Building className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-emerald-400 block">{inv.companyName}</span>
                            <h3 className="text-lg font-black text-white">{inv.jobTitle}</h3>
                          </div>
                        </div>

                        <span
                          className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                            isPending
                              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                              : 'bg-white/5 text-slate-400 border-white/10'
                          }`}
                        >
                          {isPending ? 'Action Required' : 'Completed'}
                        </span>
                      </div>

                      {/* Recruiter Message */}
                      {inv.customMessage && (
                        <div className="bg-black/40 border border-white/5 rounded-2xl p-3.5 text-xs text-slate-300 italic">
                          "{inv.customMessage}"
                        </div>
                      )}

                      {/* Skills Tags */}
                      {inv.keySkills && inv.keySkills.length > 0 && (
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Evaluation Focus Areas:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {inv.keySkills.map((skill, idx) => (
                              <span
                                key={idx}
                                className="text-[11px] px-2.5 py-0.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 font-medium"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Meta Details */}
                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-white/5">
                        <span className="flex items-center">
                          <UserCheck className="w-3.5 h-3.5 mr-1 text-slate-500" />
                          Invited by {inv.invitedBy}
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-3.5 h-3.5 mr-1 text-slate-500" />
                          Expires {new Date(inv.expiresAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="pt-5 mt-4 border-t border-white/5">
                      {isPending ? (
                        <button
                          type="button"
                          onClick={() => handleStartInvitationInterview(inv)}
                          className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center space-x-2"
                        >
                          <span>Accept & Enter Interview Chamber</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            const sess = mySessions.find(s => s.id === inv.sessionId) || mySessions[0];
                            if (sess) {
                              setSelectedSession(sess);
                              setActiveTab('feedback');
                            }
                          }}
                          className="w-full py-3 bg-white/5 hover:bg-white/10 text-slate-300 font-semibold rounded-2xl text-xs transition-all flex items-center justify-center space-x-2"
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>View Evaluation Report</span>
                        </button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ==================== TAB 2: MY INTERVIEWS & RESULTS ==================== */}
      {activeTab === 'feedback' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight flex items-center space-x-2">
                <GraduationCap className="w-6 h-6 text-indigo-400 mr-2" />
                <span>My Past Interviews & Results</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Verifiable evidence rubrics, scoring breakdown, and personalized study roadmaps.
              </p>
            </div>

            {/* Session Selector if multiple */}
            {mySessions.length > 1 && (
              <div className="flex items-center space-x-2 bg-black/40 border border-white/10 p-1.5 rounded-2xl">
                <span className="text-[11px] text-slate-400 px-2 font-bold uppercase">Session:</span>
                <select
                  value={selectedSession?.id || ''}
                  onChange={(e) => {
                    const found = mySessions.find(s => s.id === e.target.value);
                    if (found) setSelectedSession(found);
                  }}
                  className="bg-slate-900 text-xs font-bold text-white border border-white/10 rounded-xl px-3 py-1.5 outline-none"
                >
                  {mySessions.map((s, idx) => (
                    <option key={s.id} value={s.id}>
                      {s.jobTitle} &mdash; {s.date} ({s.overallScore}%)
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {selectedSession ? (
            <div className="space-y-6">
              {/* Score Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-slate-900/80 border border-white/10 p-5 rounded-2xl text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Overall Readiness</span>
                  <span className="text-3xl font-black text-white">{selectedSession.overallScore}%</span>
                  <span className="text-[10px] text-emerald-400 font-semibold block mt-1">Verified Evaluation</span>
                </Card>
                <Card className="bg-slate-900/80 border border-white/10 p-5 rounded-2xl text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Technical Depth</span>
                  <span className="text-3xl font-black text-indigo-400">{selectedSession.technicalScore}%</span>
                  <span className="text-[10px] text-slate-400 block mt-1">Problem-solving & logic</span>
                </Card>
                <Card className="bg-slate-900/80 border border-white/10 p-5 rounded-2xl text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Communication</span>
                  <span className="text-3xl font-black text-emerald-400">{selectedSession.communicationScore}%</span>
                  <span className="text-[10px] text-slate-400 block mt-1">Clarity & articulation</span>
                </Card>
                <Card className="bg-slate-900/80 border border-white/10 p-5 rounded-2xl text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Integrity Score</span>
                  <span className="text-3xl font-black text-amber-400">{selectedSession.confidenceScore}%</span>
                  <span className="text-[10px] text-slate-400 block mt-1">
                    {selectedSession.reviewMarkers?.length || 0} Review Markers
                  </span>
                </Card>
              </div>

              {/* Verified Rubric Quotes */}
              {selectedSession.rubricEvidence && selectedSession.rubricEvidence.length > 0 && (
                <div className="bg-slate-900/80 border border-white/10 rounded-3xl p-6 shadow-xl space-y-4">
                  <h3 className="text-base font-black text-white tracking-tight flex items-center">
                    <Award className="w-5 h-5 text-indigo-400 mr-2" />
                    <span>Verifiable Evidence Breakdown (Exact Candidate Quotes)</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedSession.rubricEvidence.map((rubric, i) => (
                      <div key={i} className="bg-black/40 border border-white/5 rounded-2xl p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">{rubric.criterion}</span>
                          <span className="text-xs font-mono font-bold text-indigo-400">{rubric.score}%</span>
                        </div>
                        <div className="text-xs text-slate-300 italic bg-white/[0.02] p-2.5 rounded-xl border border-white/5">
                          "{rubric.verbatimQuote}"
                        </div>
                        <p className="text-[11px] text-slate-400">{rubric.reasoning}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Study Topics & Growth Coach */}
              <CandidateGrowthCoach
                studyTopics={selectedSession.studyTopics}
                overallScore={selectedSession.overallScore}
                candidateName={user?.name || selectedSession.candidateName}
              />
            </div>
          ) : (
            <Card className="bg-slate-900/60 border border-white/5 p-12 text-center rounded-3xl">
              <GraduationCap className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-300">No Past Interviews Recorded</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-6">
                Complete an interview from your invitations or practice chamber to generate verified scores and study roadmaps.
              </p>
              <button
                type="button"
                onClick={handleStartCustomPractice}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold"
              >
                Start an Interview Now &rarr;
              </button>
            </Card>
          )}
        </div>
      )}

      {/* ==================== TAB 3: LIVE INTERVIEW CHAMBER ==================== */}
      {activeTab === 'live_interview' && (
        <div className="space-y-4">
          {/* Active Context Banner */}
          <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-3.5 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <div className="text-xs">
                <span className="font-bold text-white block">
                  {activeInvitation
                    ? `Assessment for ${activeInvitation.jobTitle} at ${activeInvitation.companyName}`
                    : 'Self-Paced Technical Practice Chamber'}
                </span>
                <span className="text-slate-400">
                  {activeInvitation
                    ? `Linked to Recruiter Invitation (${activeInvitation.id})`
                    : 'Custom calibration mode'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveTab('invitations')}
              className="text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all"
            >
              Exit to Invitations
            </button>
          </div>

          <InterviewRoom
            initialJobDescription={activeInvitation?.jobDescription || ''}
            initialResumeText={activeInvitation?.resumeText || ''}
            invitationId={activeInvitation?.id}
            onSessionComplete={(newSession) => {
              refreshData();
              setSelectedSession(newSession);
              setActiveTab('feedback');
            }}
          />
        </div>
      )}
    </div>
  );
}


'use client';

import React, { useState, useEffect } from 'react';
import { CandidateSessionRecord, InterviewInvitation } from '@/types/auth';
import { getStoredCandidates, updateCandidateTriageStatus } from '@/lib/candidateStore';
import { getStoredInvitations, saveInvitation, deleteInvitation } from '@/lib/invitationStore';
import { useAuth } from '@/context/AuthContext';
import RecruiterDashboard from '@/components/athena/RecruiterDashboard';
import { Card } from '@/components/ui/card';
import {
  Users,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ShieldAlert,
  ChevronRight,
  TrendingUp,
  Award,
  ArrowLeft,
  Calendar,
  Eye,
  FileText,
  Upload,
  Send,
  Link2,
  Copy,
  Check,
  Sparkles,
  Loader2,
  Mail,
  Building,
  UserCheck,
  Clock,
  Trash2,
  CheckCircle2
} from 'lucide-react';

export default function RecruiterPortal() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'pipeline' | 'invitations'>('pipeline');
  const [candidates, setCandidates] = useState<CandidateSessionRecord[]>([]);
  const [invitations, setInvitations] = useState<InterviewInvitation[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateSessionRecord | null>(null);

  // Filters for pipeline
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'hire' | 'next_round' | 'hold'>('all');

  // Resume Ingestion & Invitation Creator States
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState('');
  const [isParsingResume, setIsParsingResume] = useState(false);
  const [candidateName, setCandidateName] = useState('');
  const [candidateEmail, setCandidateEmail] = useState('');
  const [jobTitle, setJobTitle] = useState('Senior Fullstack Engineer');
  const [companyName, setCompanyName] = useState(user?.company || 'TechCorp Talent');
  const [jobDescription, setJobDescription] = useState(
    'Architect resilient backend microservices, implement high-concurrency event loops, optimize database read/write latency, and construct robust distributed system interfaces.'
  );
  const [keySkills, setKeySkills] = useState('System Architecture, Concurrency, Microservices, PostgreSQL');
  const [customMessage, setCustomMessage] = useState(
    'We reviewed your impressive resume background and would like to invite you to take our verified technical assessment.'
  );
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [invitationSuccess, setInvitationSuccess] = useState<InterviewInvitation | null>(null);

  const refreshData = () => {
    setCandidates(getStoredCandidates());
    setInvitations(getStoredInvitations());
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleStatusChange = (candidateId: string, newStatus: 'hire' | 'next_round' | 'hold') => {
    updateCandidateTriageStatus(candidateId, newStatus);
    setCandidates(prev =>
      prev.map(c => (c.id === candidateId ? { ...c, triageStatus: newStatus } : c))
    );
    if (selectedCandidate && selectedCandidate.id === candidateId) {
      setSelectedCandidate(prev => (prev ? { ...prev, triageStatus: newStatus } : null));
    }
  };

  // Upload Resume PDF & auto-extract text & details
  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setResumeFile(file);
    setIsParsingResume(true);

    try {
      const formData = new FormData();
      formData.append('resume', file);

      const res = await fetch('/api/parse-resume', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.text) {
        setResumeText(data.text);
        
        // Extract basic candidate hints from text
        const lines = data.text.split('\n').filter((l: string) => l.trim().length > 0);
        if (lines[0] && !candidateName) {
          setCandidateName(lines[0].replace(/[^a-zA-Z\s]/g, '').trim().slice(0, 30));
        }

        // Try to find email regex
        const emailMatch = data.text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
        if (emailMatch && !candidateEmail) {
          setCandidateEmail(emailMatch[0]);
        }
      }
    } catch (err) {
      console.warn('Resume parse warning, falling back to manual input:', err);
    } finally {
      setIsParsingResume(false);
    }
  };

  // Generate & Send Invitation Link
  const handleCreateInvitation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateName.trim() || !candidateEmail.trim() || !jobTitle.trim()) {
      alert('Please provide the candidate name, email, and job title.');
      return;
    }

    const newId = `inv-${Date.now().toString().slice(-6)}`;
    const newToken = `tok-${Math.random().toString(36).substring(2, 9)}`;

    const newInv: InterviewInvitation = {
      id: newId,
      token: newToken,
      candidateName: candidateName.trim(),
      candidateEmail: candidateEmail.trim(),
      jobTitle: jobTitle.trim(),
      companyName: companyName.trim() || 'TechCorp Talent',
      invitedBy: user?.name || 'Sarah Jenkins',
      invitedByEmail: user?.email || 'sarah.jenkins@techcorp.com',
      jobDescription: jobDescription.trim(),
      resumeText: resumeText.trim() || undefined,
      keySkills: keySkills.split(',').map(s => s.trim()).filter(Boolean),
      customMessage: customMessage.trim() || undefined,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'pending'
    };

    saveInvitation(newInv);
    setInvitationSuccess(newInv);
    refreshData();

    // Reset some form fields
    setCandidateName('');
    setCandidateEmail('');
    setResumeFile(null);
  };

  const copyInviteLink = (invId: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    const link = `${origin}/?invite=${invId}`;
    navigator.clipboard.writeText(link);
    setCopiedToken(invId);
    setTimeout(() => setCopiedToken(null), 2500);
  };

  const handleDeleteInvitation = (id: string) => {
    if (confirm('Delete this interview invitation?')) {
      deleteInvitation(id);
      refreshData();
    }
  };

  const filteredCandidates = candidates.filter(cand => {
    const matchesSearch =
      cand.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cand.jobTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || cand.triageStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalCandidates = candidates.length;
  const avgOverallScore =
    totalCandidates > 0
      ? Math.round(candidates.reduce((acc, c) => acc + c.overallScore, 0) / totalCandidates)
      : 0;
  const hireCount = candidates.filter(c => c.triageStatus === 'hire').length;
  const totalFlags = candidates.reduce((acc, c) => acc + (c.reviewMarkers?.length || 0), 0);

  // If a candidate is selected, render their full interactive Recruiter Dossier
  if (selectedCandidate) {
    return (
      <div className="w-full max-w-7xl mx-auto space-y-6 font-sans text-slate-100 animate-in fade-in duration-300">
        <button
          type="button"
          onClick={() => setSelectedCandidate(null)}
          className="inline-flex items-center space-x-2 text-xs font-bold text-indigo-400 hover:text-indigo-300 bg-white/5 border border-white/10 px-4 py-2 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Candidates ({candidates.length})</span>
        </button>

        <RecruiterDashboard
          overallScore={selectedCandidate.overallScore}
          reviewMarkers={selectedCandidate.reviewMarkers || []}
          transcript={selectedCandidate.transcript || []}
          rubricEvidence={selectedCandidate.rubricEvidence || []}
          jobTitle={selectedCandidate.jobTitle}
          candidateName={selectedCandidate.candidateName}
        />
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 font-sans text-slate-100 animate-in fade-in duration-500">
      
      {/* Top Header & Tab Switcher */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/80 border border-white/10 p-3 sm:p-4 rounded-3xl backdrop-blur-xl shadow-xl">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-black text-white text-sm shadow-md">
            {user?.avatar || (user?.name ? user.name.slice(0, 2).toUpperCase() : 'RC')}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold text-white">{user?.name || 'Recruiter Hub'}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                {user?.company || 'Talent Acquisition'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Manage candidate pipelines, upload resumes & issue verification invitations
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center space-x-2 bg-black/40 p-1.5 rounded-2xl border border-white/5">
          <button
            type="button"
            onClick={() => setActiveTab('pipeline')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              activeTab === 'pipeline'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-indigo-300" />
            <span>Candidate Pipeline ({candidates.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('invitations')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              activeTab === 'invitations'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Send className="w-3.5 h-3.5 text-emerald-300" />
            <span>Upload Resumes & Invite ({invitations.length})</span>
          </button>
        </div>
      </div>

      {/* ==================== TAB 1: CANDIDATE PIPELINE ==================== */}
      {activeTab === 'pipeline' && (
        <div className="space-y-6">
          {/* Metrics Overview Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-slate-900/80 border border-white/10 p-5 rounded-2xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Evaluated</span>
                <Users className="w-4 h-4 text-indigo-400" />
              </div>
              <span className="text-3xl font-black text-white mt-2 block">{totalCandidates}</span>
              <span className="text-[11px] text-slate-500 mt-1 block">Live simulated sessions</span>
            </Card>

            <Card className="bg-slate-900/80 border border-white/10 p-5 rounded-2xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Avg Readiness</span>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <span className="text-3xl font-black text-white mt-2 block">{avgOverallScore}%</span>
              <span className="text-[11px] text-emerald-400 mt-1 block">Based on evidence rubrics</span>
            </Card>

            <Card className="bg-slate-900/80 border border-white/10 p-5 rounded-2xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Fast-Track Hires</span>
                <Award className="w-4 h-4 text-purple-400" />
              </div>
              <span className="text-3xl font-black text-white mt-2 block">{hireCount}</span>
              <span className="text-[11px] text-purple-400 mt-1 block">High technical depth</span>
            </Card>

            <Card className="bg-slate-900/80 border border-white/10 p-5 rounded-2xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Integrity Flags</span>
                <ShieldAlert className="w-4 h-4 text-amber-400" />
              </div>
              <span className="text-3xl font-black text-white mt-2 block">{totalFlags}</span>
              <span className="text-[11px] text-amber-400 mt-1 block">Review markers logged</span>
            </Card>
          </div>

          {/* Search & Filter Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/80 border border-white/10 p-4 rounded-2xl">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
              <input
                type="text"
                placeholder="Search candidate or role..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              <span className="text-xs text-slate-400 mr-2 flex items-center shrink-0">
                <Filter className="w-3.5 h-3.5 mr-1" /> Status:
              </span>
              {(['all', 'hire', 'next_round', 'hold'] as const).map(status => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all shrink-0 ${
                    statusFilter === status
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-white/5 hover:bg-white/10 text-slate-400'
                  }`}
                >
                  {status === 'all' ? 'All' : status.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Candidates Pipeline Table */}
          <div className="bg-slate-900/80 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-black/40 border-b border-white/10 text-slate-400 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-4 px-6">Candidate</th>
                    <th className="py-4 px-6">Target Role</th>
                    <th className="py-4 px-6 text-center">Readiness</th>
                    <th className="py-4 px-6 text-center">Tech Depth</th>
                    <th className="py-4 px-6 text-center">Integrity</th>
                    <th className="py-4 px-6">Triage Status</th>
                    <th className="py-4 px-6 text-right">Dossier</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredCandidates.map(cand => (
                    <tr
                      key={cand.id}
                      onClick={() => setSelectedCandidate(cand)}
                      className="hover:bg-white/[0.03] transition-colors cursor-pointer group"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-bold text-indigo-300">
                            {cand.candidateName.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-white block group-hover:text-indigo-300 transition-colors">
                              {cand.candidateName}
                            </span>
                            <span className="text-[11px] text-slate-500">{cand.candidateEmail}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <span className="text-slate-300 block font-medium">{cand.jobTitle}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{cand.date}</span>
                      </td>

                      <td className="py-4 px-6 text-center">
                        <span className="text-sm font-black text-white">{cand.overallScore}%</span>
                      </td>

                      <td className="py-4 px-6 text-center">
                        <span className="font-mono text-indigo-400 font-bold">{cand.technicalScore}%</span>
                      </td>

                      <td className="py-4 px-6 text-center">
                        <div className="inline-flex items-center space-x-1">
                          {cand.reviewMarkers && cand.reviewMarkers.length > 0 ? (
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold">
                              {cand.reviewMarkers.length} Markers
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                              Clean
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-6" onClick={e => e.stopPropagation()}>
                        <select
                          value={cand.triageStatus}
                          onChange={e => handleStatusChange(cand.id, e.target.value as any)}
                          className={`text-[11px] font-bold rounded-lg px-2.5 py-1 border outline-none bg-black/40 ${
                            cand.triageStatus === 'hire'
                              ? 'border-emerald-500/50 text-emerald-400'
                              : cand.triageStatus === 'next_round'
                              ? 'border-indigo-500/50 text-indigo-300'
                              : 'border-rose-500/50 text-rose-400'
                          }`}
                        >
                          <option value="pending" className="bg-slate-900 text-slate-300">Pending</option>
                          <option value="hire" className="bg-slate-900 text-emerald-400">Fast-Track Hire</option>
                          <option value="next_round" className="bg-slate-900 text-indigo-300">Advance Next Round</option>
                          <option value="hold" className="bg-slate-900 text-rose-400">Hold / Flag</option>
                        </select>
                      </td>

                      <td className="py-4 px-6 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedCandidate(cand)}
                          className="px-3 py-1.5 bg-white/5 hover:bg-indigo-600 text-slate-300 hover:text-white rounded-lg transition-all font-semibold inline-flex items-center space-x-1"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" />
                          <span>Dossier</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================== TAB 2: RESUME UPLOAD & SEND INVITATION LINKS ==================== */}
      {activeTab === 'invitations' && (
        <div className="space-y-8">
          
          {/* Invitation Generator Banner */}
          <div className="bg-slate-900/80 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-2xl shadow-xl space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
              <div>
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-black uppercase tracking-widest border border-emerald-500/20 mb-2">
                  <Upload className="w-3.5 h-3.5 mr-1" />
                  <span>Resume Ingestion & Invitation Engine</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Upload Candidate Resume & Issue Interview Invitation
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Upload a candidate resume PDF or paste raw text. HireRank parses their competencies and generates an active interview link.
                </p>
              </div>
            </div>

            {/* Success Alert Banner if an invitation was just created */}
            {invitationSuccess && (
              <div className="bg-emerald-950/70 border border-emerald-500/40 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in">
                <div className="flex items-center space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-white block">
                      Invitation Created for {invitationSuccess.candidateName} ({invitationSuccess.jobTitle})
                    </span>
                    <span className="text-[11px] text-emerald-300">
                      Share the link below with the candidate or send it directly.
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => copyInviteLink(invitationSuccess.id)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all shadow-md"
                  >
                    {copiedToken === invitationSuccess.id ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Link Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Invitation Link</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setInvitationSuccess(null)}
                    className="text-xs text-slate-400 hover:text-white px-2 py-1"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}

            {/* Ingestion Form */}
            <form onSubmit={handleCreateInvitation} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Column 1: Candidate Resume PDF or Text */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                    1. Candidate Resume (PDF Upload or Text)
                  </label>

                  <div className="border border-white/10 border-dashed rounded-2xl p-5 bg-black/40 flex flex-col items-center justify-center text-center hover:border-indigo-500/50 transition-all">
                    {isParsingResume ? (
                      <div className="py-6 flex flex-col items-center">
                        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mb-2" />
                        <span className="text-xs text-indigo-300 font-semibold">Extracting text & skills via AI...</span>
                      </div>
                    ) : resumeFile ? (
                      <div className="py-4 flex flex-col items-center">
                        <FileText className="w-8 h-8 text-emerald-400 mb-2" />
                        <span className="text-xs font-bold text-white">{resumeFile.name}</span>
                        <span className="text-[10px] text-slate-400">Parsed successfully</span>
                        <label className="mt-2 text-[11px] text-indigo-400 hover:underline cursor-pointer">
                          Replace file
                          <input type="file" accept=".pdf" className="hidden" onChange={handleResumeUpload} />
                        </label>
                      </div>
                    ) : (
                      <div className="py-4 flex flex-col items-center">
                        <Upload className="w-8 h-8 text-slate-500 mb-2" />
                        <span className="text-xs text-slate-300 font-bold mb-1">Upload Candidate PDF Resume</span>
                        <span className="text-[11px] text-slate-500 mb-3">Auto-fills candidate name, email, and skills</span>
                        <label className="cursor-pointer bg-white/10 hover:bg-white/20 border border-white/10 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all">
                          Select PDF
                          <input type="file" accept=".pdf" className="hidden" onChange={handleResumeUpload} />
                        </label>
                      </div>
                    )}
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold block mb-1">
                      Or paste raw candidate experience text:
                    </span>
                    <textarea
                      rows={4}
                      value={resumeText}
                      onChange={e => setResumeText(e.target.value)}
                      placeholder="Paste resume summary, work history, or past projects..."
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
                    />
                  </div>
                </div>

                {/* Column 2: Candidate & Role Fields */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
                        Candidate Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Alex Rivera"
                        value={candidateName}
                        onChange={e => setCandidateName(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
                        Candidate Email *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="e.g. alex@example.com"
                        value={candidateEmail}
                        onChange={e => setCandidateEmail(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
                        Target Role / Job Title *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Senior Fullstack Engineer"
                        value={jobTitle}
                        onChange={e => setJobTitle(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
                        Company Name
                      </label>
                      <input
                        type="text"
                        value={companyName}
                        onChange={e => setCompanyName(e.target.value)}
                        placeholder="e.g. TechCorp Talent"
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
                      Key Evaluation Skills (Comma Separated)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. System Design, Kafka, Redis, Concurrency"
                      value={keySkills}
                      onChange={e => setKeySkills(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
                      Target Job Description (Drives Adaptive Engine Probes)
                    </label>
                    <textarea
                      rows={3}
                      value={jobDescription}
                      onChange={e => setJobDescription(e.target.value)}
                      placeholder="Specify requirements or key architectural challenges..."
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4 border-t border-white/10 flex justify-end">
                <button
                  type="submit"
                  disabled={isParsingResume}
                  className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-2xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-indigo-600/30 flex items-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Generate & Issue Interview Invitation Link &rarr;</span>
                </button>
              </div>
            </form>
          </div>

          {/* Table of Sent Invitations */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-white tracking-tight flex items-center">
                <Link2 className="w-5 h-5 text-indigo-400 mr-2" />
                <span>Active & Past Sent Invitations ({invitations.length})</span>
              </h3>
              <span className="text-xs text-slate-400">
                Candidates open these links to enter the verified assessment chamber
              </span>
            </div>

            <div className="bg-slate-900/80 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-black/40 border-b border-white/10 text-slate-400 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="py-4 px-6">Invited Candidate</th>
                      <th className="py-4 px-6">Target Role & Company</th>
                      <th className="py-4 px-6">Evaluation Focus</th>
                      <th className="py-4 px-6 text-center">Status</th>
                      <th className="py-4 px-6 text-center">Invitation Link</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {invitations.map(inv => {
                      const isPending = inv.status === 'pending';
                      const completedSession = candidates.find(
                        c => c.id === inv.sessionId || c.candidateEmail === inv.candidateEmail
                      );

                      return (
                        <tr key={inv.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-4 px-6">
                            <span className="font-bold text-white block">{inv.candidateName}</span>
                            <span className="text-[11px] text-slate-500">{inv.candidateEmail}</span>
                          </td>

                          <td className="py-4 px-6">
                            <span className="text-slate-200 block font-semibold">{inv.jobTitle}</span>
                            <span className="text-[10px] text-slate-500">{inv.companyName}</span>
                          </td>

                          <td className="py-4 px-6">
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {inv.keySkills?.slice(0, 3).map((skill, i) => (
                                <span
                                  key={i}
                                  className="text-[10px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </td>

                          <td className="py-4 px-6 text-center">
                            <span
                              className={`inline-flex items-center text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                                isPending
                                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              }`}
                            >
                              {isPending ? (
                                <>
                                  <Clock className="w-3 h-3 mr-1" />
                                  <span>Pending Candidate</span>
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  <span>Interview Completed</span>
                                </>
                              )}
                            </span>
                          </td>

                          <td className="py-4 px-6 text-center">
                            <button
                              type="button"
                              onClick={() => copyInviteLink(inv.id)}
                              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all text-xs font-semibold inline-flex items-center space-x-1.5"
                              title="Copy candidate interview link"
                            >
                              {copiedToken === inv.id ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                  <span className="text-emerald-400">Copied!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                                  <span>Copy Link</span>
                                </>
                              )}
                            </button>
                          </td>

                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              {!isPending && completedSession ? (
                                <button
                                  type="button"
                                  onClick={() => setSelectedCandidate(completedSession)}
                                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold text-xs transition-all flex items-center space-x-1"
                                >
                                  <Eye className="w-3.5 h-3.5 mr-1" />
                                  <span>View Dossier</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteInvitation(inv.id)}
                                  className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg transition-colors"
                                  title="Delete invitation"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

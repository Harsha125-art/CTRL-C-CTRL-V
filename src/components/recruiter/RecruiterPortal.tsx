'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  CheckCircle2,
  ExternalLink,
  Plus,
  RefreshCw
} from 'lucide-react';

interface QueuedCandidate {
  id: string;
  fileName: string;
  name: string;
  email: string;
  skills: string[];
  resumeText: string;
  status: 'parsing' | 'ready' | 'sending' | 'sent' | 'error';
  errorMessage?: string;
  inviteId?: string;
  inviteLink?: string;
}

export default function RecruiterPortal() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'pipeline' | 'invitations'>('pipeline');
  const [candidates, setCandidates] = useState<CandidateSessionRecord[]>([]);
  const [invitations, setInvitations] = useState<InterviewInvitation[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateSessionRecord | null>(null);

  // Filters for pipeline
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'hire' | 'next_round' | 'hold'>('all');

  // Multi-Resume & Job Description Setup States
  const [jobTitle, setJobTitle] = useState('Senior Fullstack Engineer');
  const [companyName, setCompanyName] = useState(user?.company || 'TechCorp Talent');
  const [jobDescription, setJobDescription] = useState(
    'Architect resilient backend microservices, implement high-concurrency event loops, optimize database read/write latency, and construct robust distributed system interfaces.'
  );
  const [customMessage, setCustomMessage] = useState(
    'We reviewed your impressive resume background and would like to invite you to take our verified technical assessment.'
  );

  // Candidate Queue for Multi-Resume Upload
  const [candidateQueue, setCandidateQueue] = useState<QueuedCandidate[]>([]);
  const [isProcessingBatch, setIsProcessingBatch] = useState(false);
  const [isSendingAll, setIsSendingAll] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [notificationMessage, setNotificationMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // MULTI-RESUME UPLOAD HANDLER
  const handleMultipleResumesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsProcessingBatch(true);

    for (const file of files) {
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      
      // Add candidate placeholder in queue with status 'parsing'
      setCandidateQueue(prev => [
        ...prev,
        {
          id: tempId,
          fileName: file.name,
          name: file.name.replace(/\.pdf$/i, '').replace(/[-_]/g, ' '),
          email: '',
          skills: ['System Design', 'Core Engineering'],
          resumeText: '',
          status: 'parsing'
        }
      ]);

      try {
        // Step 1: Parse PDF
        const formData = new FormData();
        formData.append('resume', file);

        const parseRes = await fetch('/api/parse-resume', {
          method: 'POST',
          body: formData,
        });

        const parseData = await parseRes.json();
        const text = parseData.text || '';

        // Step 2: AI extraction of Candidate Name, Email, Skills
        let extractedName = file.name.replace(/\.pdf$/i, '').replace(/[-_]/g, ' ');
        let extractedEmail = '';
        let extractedSkills: string[] = ['System Design', 'TypeScript', 'Backend Architecture'];

        if (text) {
          try {
            const extractRes = await fetch('/api/extract-candidate-info', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ resumeText: text }),
            });

            if (extractRes.ok) {
              const info = await extractRes.json();
              if (info.name) extractedName = info.name;
              if (info.email) extractedEmail = info.email;
              if (info.skills && info.skills.length > 0) extractedSkills = info.skills;
            }
          } catch (err) {
            console.warn('AI extraction fallback:', err);
          }
        }

        // Update queued candidate with extracted data
        setCandidateQueue(prev =>
          prev.map(c =>
            c.id === tempId
              ? {
                  ...c,
                  name: extractedName,
                  email: extractedEmail || `${extractedName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
                  skills: extractedSkills,
                  resumeText: text,
                  status: 'ready'
                }
              : c
          )
        );
      } catch (fileErr: any) {
        setCandidateQueue(prev =>
          prev.map(c =>
            c.id === tempId
              ? {
                  ...c,
                  status: 'error',
                  errorMessage: fileErr.message || 'Failed to parse resume PDF'
                }
              : c
          )
        );
      }
    }

    setIsProcessingBatch(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Add Manual Candidate to Queue
  const handleAddManualCandidate = () => {
    const tempId = `temp-${Date.now()}`;
    setCandidateQueue(prev => [
      ...prev,
      {
        id: tempId,
        fileName: 'Manual Entry',
        name: 'New Candidate',
        email: 'candidate@example.com',
        skills: ['Fullstack Engineering', 'System Architecture'],
        resumeText: 'Experienced software engineer.',
        status: 'ready'
      }
    ]);
  };

  const handleUpdateQueuedCandidate = (id: string, field: 'name' | 'email', value: string) => {
    setCandidateQueue(prev =>
      prev.map(c => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const handleRemoveQueuedCandidate = (id: string) => {
    setCandidateQueue(prev => prev.filter(c => c.id !== id));
  };

  // SEND INVITATION VIA EMAIL FOR A SINGLE CANDIDATE
  const handleSendSingleEmail = async (cand: QueuedCandidate) => {
    if (!cand.email || !cand.email.includes('@')) {
      alert(`Please provide a valid email for ${cand.name}`);
      return;
    }

    setCandidateQueue(prev =>
      prev.map(c => (c.id === cand.id ? { ...c, status: 'sending' } : c))
    );

    const invId = `inv-${Date.now().toString().slice(-6)}`;
    const token = `tok-${Math.random().toString(36).substring(2, 9)}`;
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    const inviteLink = `${origin}/?invite=${invId}`;

    const newInv: InterviewInvitation = {
      id: invId,
      token,
      candidateName: cand.name.trim(),
      candidateEmail: cand.email.trim(),
      jobTitle: jobTitle.trim(),
      companyName: companyName.trim() || 'TechCorp Talent',
      invitedBy: user?.name || 'Sarah Jenkins',
      invitedByEmail: user?.email || 'sarah.jenkins@techcorp.com',
      jobDescription: jobDescription.trim(),
      resumeText: cand.resumeText || undefined,
      keySkills: cand.skills || ['System Design', 'Concurrency'],
      customMessage: customMessage.trim() || undefined,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'pending'
    };

    saveInvitation(newInv);

    try {
      const emailRes = await fetch('/api/send-invitation-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: cand.email.trim(),
          candidateName: cand.name.trim(),
          jobTitle: jobTitle.trim(),
          companyName: companyName.trim(),
          invitedBy: user?.name || 'Sarah Jenkins',
          inviteLink,
          customMessage: customMessage.trim(),
          skills: cand.skills
        }),
      });

      const emailData = await emailRes.json();
      console.log('Invitation email dispatch result:', emailData);

      setCandidateQueue(prev =>
        prev.map(c =>
          c.id === cand.id
            ? { ...c, status: 'sent', inviteId: invId, inviteLink }
            : c
        )
      );

      setNotificationMessage(`Interview invitation email successfully dispatched to ${cand.email}!`);
      setTimeout(() => setNotificationMessage(null), 4000);
      refreshData();
    } catch (err: any) {
      console.error('Failed to dispatch email:', err);
      setCandidateQueue(prev =>
        prev.map(c =>
          c.id === cand.id
            ? { ...c, status: 'error', errorMessage: 'Email dispatch failed' }
            : c
        )
      );
    }
  };

  // BATCH SEND INVITATION EMAILS TO ALL READY CANDIDATES
  const handleSendAllEmails = async () => {
    const readyCandidates = candidateQueue.filter(c => c.status === 'ready');
    if (readyCandidates.length === 0) {
      alert('No ready candidates to invite. Upload resumes or add candidates first.');
      return;
    }

    setIsSendingAll(true);
    let sentCount = 0;

    for (const cand of readyCandidates) {
      await handleSendSingleEmail(cand);
      sentCount++;
    }

    setIsSendingAll(false);
    setNotificationMessage(`Successfully dispatched ${sentCount} interview invitation email(s)!`);
    setTimeout(() => setNotificationMessage(null), 5000);
  };

  // RESEND EMAIL FOR PREVIOUSLY ISSUED INVITATION
  const handleResendInvitationEmail = async (inv: InterviewInvitation) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    const inviteLink = `${origin}/?invite=${inv.id}`;

    try {
      await fetch('/api/send-invitation-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: inv.candidateEmail,
          candidateName: inv.candidateName,
          jobTitle: inv.jobTitle,
          companyName: inv.companyName,
          invitedBy: inv.invitedBy,
          inviteLink,
          customMessage: inv.customMessage,
          skills: inv.keySkills
        }),
      });

      setNotificationMessage(`Resent interview invitation email to ${inv.candidateEmail}!`);
      setTimeout(() => setNotificationMessage(null), 3500);
    } catch (e) {
      alert('Failed to resend email.');
    }
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
              Manage candidate pipelines, batch upload resumes & dispatch email invitations
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
            <span>Batch Upload & Invite ({invitations.length})</span>
          </button>
        </div>
      </div>

      {/* Global Notification Toast */}
      {notificationMessage && (
        <div className="bg-emerald-950/90 border border-emerald-500/50 rounded-2xl p-4 flex items-center justify-between text-emerald-200 text-xs font-bold shadow-2xl animate-in fade-in">
          <div className="flex items-center space-x-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{notificationMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotificationMessage(null)}
            className="text-[11px] text-slate-400 hover:text-white underline ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

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

      {/* ==================== TAB 2: MULTI-RESUME INGESTION & EMAIL INVITATIONS ==================== */}
      {activeTab === 'invitations' && (
        <div className="space-y-8">
          
          {/* Top Config Card: Job Description & Target Role */}
          <div className="bg-slate-900/80 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-2xl shadow-xl space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
              <div>
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-black uppercase tracking-widest border border-emerald-500/20 mb-2">
                  <Mail className="w-3.5 h-3.5 mr-1" />
                  <span>Multi-Resume Ingestion & Email Dispatcher</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Upload Candidate Resumes & Send Interview Invitations
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Upload multiple candidate resumes simultaneously. HireRank extracts candidate identities and emails them verified interview invitation links.
                </p>
              </div>
            </div>

            {/* Target Role & Job Description Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                  Target Role / Job Title *
                </label>
                <input
                  type="text"
                  required
                  value={jobTitle}
                  onChange={e => setJobTitle(e.target.value)}
                  placeholder="e.g. Senior Fullstack Engineer"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                  Hiring Company
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  placeholder="e.g. TechCorp Talent"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                  Email Message Note (Appears in candidate invitation)
                </label>
                <input
                  type="text"
                  value={customMessage}
                  onChange={e => setCustomMessage(e.target.value)}
                  placeholder="e.g. We were impressed with your background..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                Target Job Description (Shapes Adaptive Technical Interview Questions)
              </label>
              <textarea
                rows={2}
                value={jobDescription}
                onChange={e => setJobDescription(e.target.value)}
                placeholder="Specify core responsibilities, architectural challenges, and tech stack..."
                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
              />
            </div>

            {/* MULTI-RESUME DROPZONE */}
            <div className="pt-4 border-t border-white/10">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                Upload Candidate Resumes (Select Multiple PDFs)
              </label>

              <div className="border-2 border-dashed border-white/10 hover:border-emerald-500/50 rounded-3xl p-8 bg-black/30 flex flex-col items-center justify-center text-center transition-all group">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3 group-hover:scale-105 transition-transform">
                  <Upload className="w-7 h-7" />
                </div>
                <h4 className="text-base font-bold text-white mb-1">
                  Upload One or Multiple Candidate Resumes
                </h4>
                <p className="text-xs text-slate-400 max-w-md mb-4">
                  Select multiple PDF files at once. HireRank will automatically parse every resume and extract candidate names, emails, and technical competencies.
                </p>

                <div className="flex items-center space-x-3">
                  <label className="cursor-pointer px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-emerald-600/30 flex items-center space-x-2">
                    {isProcessingBatch ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Parsing Resumes...</span>
                      </>
                    ) : (
                      <>
                        <FileText className="w-4 h-4" />
                        <span>Select PDF Resumes (Multiple Allowed)</span>
                      </>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept=".pdf"
                      disabled={isProcessingBatch}
                      className="hidden"
                      onChange={handleMultipleResumesUpload}
                    />
                  </label>

                  <button
                    type="button"
                    onClick={handleAddManualCandidate}
                    className="px-4 py-3 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-xs font-semibold border border-white/10 transition-all flex items-center space-x-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Candidate Manually</span>
                  </button>
                </div>
              </div>
            </div>

            {/* QUEUED CANDIDATES TO BE INVITED */}
            {candidateQueue.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-white/10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-black text-white flex items-center space-x-2">
                      <Sparkles className="w-5 h-5 text-indigo-400" />
                      <span>Parsed Candidates Queue ({candidateQueue.length})</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Verify candidate names and emails below, then dispatch interview invitations via email.
                    </p>
                  </div>

                  <div className="flex items-center space-x-3">
                    <button
                      type="button"
                      onClick={() => setCandidateQueue([])}
                      className="text-xs text-slate-400 hover:text-white px-2 py-1"
                    >
                      Clear Queue
                    </button>

                    <button
                      type="button"
                      onClick={handleSendAllEmails}
                      disabled={isSendingAll || candidateQueue.filter(c => c.status === 'ready').length === 0}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-indigo-600/30 flex items-center space-x-2"
                    >
                      {isSendingAll ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Dispatching Emails...</span>
                        </>
                      ) : (
                        <>
                          <Mail className="w-4 h-4" />
                          <span>Send Email Invitations to All ({candidateQueue.filter(c => c.status === 'ready').length})</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {candidateQueue.map((cand, idx) => (
                    <div
                      key={cand.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        cand.status === 'sent'
                          ? 'bg-emerald-950/20 border-emerald-500/30'
                          : cand.status === 'parsing'
                          ? 'bg-black/30 border-white/10 animate-pulse'
                          : cand.status === 'error'
                          ? 'bg-rose-950/20 border-rose-500/30'
                          : 'bg-black/40 border-white/10'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        {/* File & Name */}
                        <div className="flex items-center space-x-3 flex-1 min-w-[200px]">
                          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-bold text-white text-xs">
                            {idx + 1}
                          </div>
                          <div className="flex-1">
                            <span className="text-[10px] text-slate-500 font-mono block">
                              Source: {cand.fileName}
                            </span>
                            <input
                              type="text"
                              value={cand.name}
                              onChange={e => handleUpdateQueuedCandidate(cand.id, 'name', e.target.value)}
                              placeholder="Candidate Name"
                              className="bg-transparent font-bold text-white text-sm focus:bg-slate-900 border-b border-transparent focus:border-indigo-500/50 outline-none w-full"
                            />
                          </div>
                        </div>

                        {/* Email Input */}
                        <div className="flex-1 min-w-[220px]">
                          <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                            Candidate Email (For Invitation)
                          </label>
                          <div className="relative">
                            <Mail className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
                            <input
                              type="email"
                              required
                              value={cand.email}
                              onChange={e => handleUpdateQueuedCandidate(cand.id, 'email', e.target.value)}
                              placeholder="candidate@example.com"
                              className="w-full bg-slate-900 border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                            />
                          </div>
                        </div>

                        {/* Status & Actions */}
                        <div className="flex items-center space-x-3">
                          {cand.status === 'parsing' ? (
                            <span className="inline-flex items-center space-x-1.5 text-xs text-indigo-300 font-bold">
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Parsing...</span>
                            </span>
                          ) : cand.status === 'sent' ? (
                            <div className="flex items-center space-x-2">
                              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-bold rounded-xl border border-emerald-500/30 flex items-center space-x-1">
                                <Check className="w-3.5 h-3.5" />
                                <span>Email Sent</span>
                              </span>
                              {cand.inviteId && (
                                <button
                                  type="button"
                                  onClick={() => copyInviteLink(cand.inviteId!)}
                                  className="p-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl transition-all"
                                  title="Copy invite link"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          ) : cand.status === 'error' ? (
                            <span className="text-xs text-rose-400 font-semibold">{cand.errorMessage}</span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleSendSingleEmail(cand)}
                              disabled={cand.status === 'sending'}
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md flex items-center space-x-1.5"
                            >
                              {cand.status === 'sending' ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Send className="w-3.5 h-3.5" />
                              )}
                              <span>Send Email</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleRemoveQueuedCandidate(cand.id)}
                            className="p-2 text-slate-500 hover:text-rose-400 transition-colors"
                            title="Remove candidate"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Extracted Skills Chips */}
                      {cand.skills && cand.skills.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 mt-2.5 pt-2 border-t border-white/5">
                          <span className="text-[10px] text-slate-500 uppercase font-bold mr-1">Skills:</span>
                          {cand.skills.map((skill, si) => (
                            <span
                              key={si}
                              className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-slate-300"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ACTIVE & PAST SENT INVITATIONS TABLE */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-xl font-black text-white tracking-tight flex items-center">
                  <Link2 className="w-5 h-5 text-indigo-400 mr-2" />
                  <span>Active & Sent Candidate Invitations ({invitations.length})</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Track delivery status, copy links, resend emails, or review completed candidate dossiers.
                </p>
              </div>

              <button
                type="button"
                onClick={refreshData}
                className="self-start sm:self-auto px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh Status</span>
              </button>
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
                    {invitations.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-500">
                          No invitations issued yet. Upload resumes above to send your first batch of candidate invitations.
                        </td>
                      </tr>
                    ) : (
                      invitations.map(inv => {
                        const isPending = inv.status === 'pending';
                        const completedSession = candidates.find(
                          c => c.id === inv.sessionId || c.candidateEmail === inv.candidateEmail
                        );
                        const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
                        const inviteLink = `${origin}/?invite=${inv.id}`;
                        const mailtoSubject = encodeURIComponent(`Interview Invitation: ${inv.jobTitle} at ${inv.companyName}`);
                        const mailtoBody = encodeURIComponent(`Hi ${inv.candidateName},\n\nYou are invited to complete your technical interview for ${inv.jobTitle}.\n\nPlease start your assessment here:\n${inviteLink}\n\nBest regards,\n${inv.invitedBy}`);
                        const mailtoUrl = `mailto:${inv.candidateEmail}?subject=${mailtoSubject}&body=${mailtoBody}`;

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
                                {/* Native Mailto Client Trigger */}
                                <a
                                  href={mailtoUrl}
                                  className="p-1.5 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-indigo-300 rounded-lg transition-colors inline-flex"
                                  title="Open in your default email client (mailto)"
                                >
                                  <Mail className="w-3.5 h-3.5" />
                                </a>

                                {/* In-App Email Resend */}
                                {isPending && (
                                  <button
                                    type="button"
                                    onClick={() => handleResendInvitationEmail(inv)}
                                    className="p-1.5 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-emerald-300 rounded-lg transition-colors inline-flex"
                                    title="Resend invitation email"
                                  >
                                    <Send className="w-3.5 h-3.5" />
                                  </button>
                                )}

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
                      })
                    )}
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

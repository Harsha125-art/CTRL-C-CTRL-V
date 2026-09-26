'use client';

import React, { useState, useEffect } from 'react';
import { CandidateSessionRecord } from '@/types/auth';
import { getStoredCandidates, updateCandidateTriageStatus } from '@/lib/candidateStore';
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
  FileText
} from 'lucide-react';

export default function RecruiterPortal() {
  const [candidates, setCandidates] = useState<CandidateSessionRecord[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateSessionRecord | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'hire' | 'next_round' | 'hold'>('all');

  useEffect(() => {
    setCandidates(getStoredCandidates());
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
    <div className="w-full max-w-7xl mx-auto space-y-8 font-sans text-slate-100 animate-in fade-in duration-500">
      
      {/* Recruiter Header & High-Level Telemetry */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Recruiter & Hiring Lead Portal
            </span>
            <span className="text-xs text-slate-400 font-medium">Enterprise Candidate Pool</span>
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight mt-1">
            Candidate Pipeline & Session Triage
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Review live interview sessions, verify CV integrity timelines, and inspect evidence-based ratings.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-3 text-center">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Total Screened</span>
            <span className="text-2xl font-black text-white">{totalCandidates}</span>
          </div>
          <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-3 text-center">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Avg Readiness</span>
            <span className="text-2xl font-black text-emerald-400">{avgOverallScore}%</span>
          </div>
          <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-3 text-center">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Fast-Track Hires</span>
            <span className="text-2xl font-black text-indigo-400">{hireCount}</span>
          </div>
          <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-3 text-center">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Integrity Flags</span>
            <span className="text-2xl font-black text-amber-400">{totalFlags}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/80 border border-white/10 p-3 rounded-2xl backdrop-blur-xl">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search candidates by name or target engineering role..."
            className="w-full bg-black/40 border border-white/5 rounded-xl py-2 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <Filter className="w-3.5 h-3.5 text-slate-400 mr-1" />
          {(['all', 'hire', 'next_round', 'hold'] as const).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all uppercase text-[10px] tracking-wider ${
                statusFilter === status
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {status === 'all' ? 'All' : status.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Candidate Performance Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCandidates.map((cand) => {
          const markerCount = cand.reviewMarkers?.length || 0;
          return (
            <Card
              key={cand.id}
              className="bg-slate-900/80 border border-white/10 hover:border-indigo-500/40 rounded-3xl p-6 shadow-xl flex flex-col justify-between transition-all duration-300 group"
            >
              <div className="space-y-4">
                {/* Card Header */}
                <div className="flex items-start justify-between">
                  <div className="space-y-0.5">
                    <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                      {cand.candidateName}
                    </h3>
                    <p className="text-xs text-slate-400 font-medium">{cand.jobTitle}</p>
                    <span className="text-[10px] text-slate-500 font-mono block mt-1">
                      {cand.date}
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${
                      cand.triageStatus === 'hire'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : cand.triageStatus === 'next_round'
                        ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    {cand.triageStatus.replace('_', ' ')}
                  </span>
                </div>

                {/* Score Summary Metrics */}
                <div className="grid grid-cols-3 gap-2 bg-black/40 p-3 rounded-2xl border border-white/5 text-center">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Overall</span>
                    <span className="text-base font-black text-white">{cand.overallScore}%</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Technical</span>
                    <span className="text-base font-black text-indigo-400">{cand.technicalScore}%</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Eye Contact</span>
                    <span className="text-base font-black text-emerald-400">{cand.confidenceScore}%</span>
                  </div>
                </div>

                {/* CV Integrity Status */}
                <div className="flex items-center justify-between text-xs px-1">
                  <div className="flex items-center space-x-1.5">
                    <ShieldAlert
                      className={`w-4 h-4 ${
                        markerCount === 0
                          ? 'text-emerald-400'
                          : markerCount === 1
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}
                    />
                    <span className="text-slate-300 text-[11px] font-semibold">
                      {markerCount === 0
                        ? 'Verified Clean Integrity'
                        : `${markerCount} Integrity Markers`}
                    </span>
                  </div>

                  <span className="text-[10px] text-slate-500">
                    {cand.transcript?.length || 0} transcript turns
                  </span>
                </div>
              </div>

              {/* Triage Decision & Inspect Dossier */}
              <div className="pt-4 border-t border-white/10 mt-5 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Decision:</span>
                  <div className="flex space-x-1.5">
                    <button
                      type="button"
                      onClick={() => handleStatusChange(cand.id, 'hire')}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        cand.triageStatus === 'hire'
                          ? 'bg-emerald-500 text-white'
                          : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                      }`}
                    >
                      Hire
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusChange(cand.id, 'next_round')}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        cand.triageStatus === 'next_round'
                          ? 'bg-indigo-500 text-white'
                          : 'bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20'
                      }`}
                    >
                      Next
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusChange(cand.id, 'hold')}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        cand.triageStatus === 'hold'
                          ? 'bg-rose-500 text-white'
                          : 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20'
                      }`}
                    >
                      Hold
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedCandidate(cand)}
                  className="w-full py-2.5 bg-indigo-600/80 hover:bg-indigo-600 text-white font-bold rounded-xl text-xs flex items-center justify-center transition-all shadow-md group-hover:shadow-indigo-600/25"
                >
                  <FileText className="w-3.5 h-3.5 mr-1.5" />
                  <span>Inspect Timeline & Evidence Dossier &rarr;</span>
                </button>
              </div>
            </Card>
          );
        })}
      </div>

      {filteredCandidates.length === 0 && (
        <div className="text-center py-16 bg-white/[0.02] border border-white/5 rounded-3xl">
          <Users className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <h4 className="text-base font-bold text-white">No candidates match your filter</h4>
          <p className="text-xs text-slate-500 mt-1">Try clearing your search query or status filter.</p>
        </div>
      )}
    </div>
  );
}

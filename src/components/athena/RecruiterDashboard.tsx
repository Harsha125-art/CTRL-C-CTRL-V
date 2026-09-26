import React, { useState, useRef } from 'react';
import { ReviewMarker, TranscriptTurn, RubricEvidenceItem } from '@/types/athena';
import { Card } from '@/components/ui/card';
import {
  ShieldAlert,
  Clock,
  Quote,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ChevronRight,
  UserCheck,
  PauseCircle,
  ArrowUpRight,
  Filter,
  Eye
} from 'lucide-react';

interface RecruiterDashboardProps {
  overallScore: number;
  reviewMarkers: ReviewMarker[];
  transcript: TranscriptTurn[];
  rubricEvidence: RubricEvidenceItem[];
  jobTitle?: string;
  candidateName?: string;
}

export default function RecruiterDashboard({
  overallScore,
  reviewMarkers = [],
  transcript = [],
  rubricEvidence = [],
  jobTitle = 'Senior Software Engineer',
  candidateName = 'Candidate 104'
}: RecruiterDashboardProps) {
  const [highlightedTurnId, setHighlightedTurnId] = useState<string | null>(null);
  const [triageDecision, setTriageDecision] = useState<'hire' | 'hold' | 'next_round' | null>(null);
  const [markerFilter, setMarkerFilter] = useState<'all' | 'high' | 'medium'>('all');
  const transcriptContainerRef = useRef<HTMLDivElement>(null);

  // Jump to transcript turn and highlight it
  const jumpToTimestamp = (timestamp: string, quote?: string) => {
    // Find closest turn in transcript
    const matchingTurn = transcript.find(
      (t) => t.timestamp === timestamp || (quote && t.text.includes(quote.slice(0, 30)))
    ) || transcript.find((t) => t.timestamp.startsWith(timestamp.slice(0, 3)));

    if (matchingTurn) {
      setHighlightedTurnId(matchingTurn.id);
      const element = document.getElementById(`turn-${matchingTurn.id}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  const filteredMarkers = reviewMarkers.filter((m) => {
    if (markerFilter === 'high') return m.severity === 'high';
    if (markerFilter === 'medium') return m.severity === 'medium' || m.severity === 'high';
    return true;
  });

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500 font-sans">
      {/* Recruiter Header & Decision Bar */}
      <div className="bg-slate-900/90 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-2xl shadow-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-black tracking-widest uppercase border border-indigo-500/30">
              HireRank Recruiter Triage
            </span>
            <span className="text-xs text-slate-400 font-medium">Athena Audit Dossier</span>
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight">{candidateName} &mdash; {jobTitle}</h2>
          <p className="text-sm text-slate-400">
            Automated session verification with contextual vision integrity markers & verbatim evidence.
          </p>
        </div>

        {/* Triage Decision Buttons */}
        <div className="flex items-center space-x-3 bg-black/40 p-2 rounded-2xl border border-white/10 shrink-0">
          <button
            type="button"
            onClick={() => setTriageDecision('hire')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center transition-all ${
              triageDecision === 'hire'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
            }`}
          >
            <UserCheck className="w-4 h-4 mr-1.5" />
            <span>Fast-Track Hire</span>
          </button>

          <button
            type="button"
            onClick={() => setTriageDecision('next_round')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center transition-all ${
              triageDecision === 'next_round'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20'
            }`}
          >
            <ChevronRight className="w-4 h-4 mr-1.5" />
            <span>Advance Next Round</span>
          </button>

          <button
            type="button"
            onClick={() => setTriageDecision('hold')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center transition-all ${
              triageDecision === 'hold'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                : 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20'
            }`}
          >
            <PauseCircle className="w-4 h-4 mr-1.5" />
            <span>Hold / Flag</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Contextual Integrity Timeline + Clickable Transcript */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Contextual Integrity Timeline (4 cols) */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          <Card className="bg-slate-900/80 border border-white/10 rounded-3xl p-6 shadow-xl flex flex-col h-[680px]">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
              <div className="flex items-center space-x-2">
                <ShieldAlert className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                  Contextual Integrity Timeline
                </h3>
              </div>
              <span className="text-xs bg-white/5 border border-white/10 px-2.5 py-1 rounded-full text-slate-300 font-bold">
                {reviewMarkers.length} Markers
              </span>
            </div>

            <p className="text-xs text-slate-400 pt-3 pb-2 shrink-0">
              Observable visual and environmental events logged via client-side CV. Click any event to jump to that moment in the candidate transcript.
            </p>

            {/* Marker List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar pt-2">
              {filteredMarkers.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-center p-6 bg-white/[0.02] rounded-2xl border border-white/5">
                  <CheckCircle className="w-10 h-10 text-emerald-400 mb-2" />
                  <p className="text-sm font-bold text-slate-200">Clean Integrity Record</p>
                  <p className="text-xs text-slate-500 mt-1">
                    No visual anomalies or multi-face incursions observed during the session.
                  </p>
                </div>
              ) : (
                filteredMarkers.map((marker) => (
                  <button
                    key={marker.id}
                    type="button"
                    onClick={() => jumpToTimestamp(marker.timestamp)}
                    className="w-full text-left p-3.5 rounded-2xl border transition-all duration-200 group bg-slate-950/60 hover:bg-slate-800/80 border-white/5 hover:border-indigo-500/40"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            marker.severity === 'high'
                              ? 'bg-rose-500'
                              : marker.severity === 'medium'
                              ? 'bg-amber-500'
                              : 'bg-indigo-400'
                          }`}
                        />
                        <span className="font-bold text-xs text-slate-200 group-hover:text-indigo-300 transition-colors">
                          {marker.label}
                        </span>
                      </div>
                      <span className="font-mono text-xs text-slate-400 bg-black/40 px-2 py-0.5 rounded-md border border-white/5">
                        {marker.timestamp}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {marker.details}
                    </p>

                    <div className="flex items-center justify-end text-[10px] text-indigo-400 font-bold uppercase tracking-wider mt-2 group-hover:underline">
                      <span>Jump to Transcript</span>
                      <ArrowUpRight className="w-3 h-3 ml-1" />
                    </div>
                  </button>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Right Column: Full Interactive Transcript with Jumps (7 cols) */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          <Card className="bg-slate-900/80 border border-white/10 rounded-3xl p-6 shadow-xl flex flex-col h-[680px]">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
              <div className="flex items-center space-x-2">
                <Quote className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                  Verbatim Interview Transcript
                </h3>
              </div>
              <span className="text-xs text-slate-400">
                {transcript.length} turns recorded
              </span>
            </div>

            {/* Transcript Scroll Container */}
            <div
              ref={transcriptContainerRef}
              className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar pt-3"
            >
              {transcript.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-center p-6 text-slate-500">
                  <p className="text-sm">No spoken transcript available for this session.</p>
                </div>
              ) : (
                transcript.map((turn) => {
                  const isHighlighted = highlightedTurnId === turn.id;
                  const isCandidate = turn.speaker === 'candidate';

                  return (
                    <div
                      key={turn.id}
                      id={`turn-${turn.id}`}
                      className={`p-4 rounded-2xl border transition-all duration-300 ${
                        isHighlighted
                          ? 'bg-indigo-950/80 border-indigo-400 shadow-[0_0_30px_rgba(99,102,241,0.3)] ring-2 ring-indigo-500/50'
                          : isCandidate
                          ? 'bg-slate-950/60 border-white/5'
                          : 'bg-indigo-950/20 border-indigo-500/10'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              isCandidate
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20'
                            }`}
                          >
                            {isCandidate ? 'Candidate' : 'Interviewer (Athena)'}
                          </span>
                          {turn.competency && (
                            <span className="text-[10px] text-slate-400 font-medium">
                              &bull; {turn.competency}
                            </span>
                          )}
                        </div>
                        <span className="font-mono text-xs text-slate-400 bg-black/40 px-2 py-0.5 rounded-md">
                          {turn.timestamp}
                        </span>
                      </div>

                      <p className="text-sm text-slate-200 leading-relaxed">
                        {turn.text}
                      </p>

                      {turn.codeSnippet && (
                        <div className="mt-3 bg-black/80 rounded-xl p-3 border border-white/5 font-mono text-xs text-indigo-300 overflow-x-auto">
                          <pre>{turn.codeSnippet}</pre>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Evidence-First Rubric Scoring Matrix */}
      <Card className="bg-slate-900/80 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10 mb-6">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Evidence-First Scoring
              </span>
              <span className="text-xs text-slate-400 font-medium">Zero-Hallucination Rubrics</span>
            </div>
            <h3 className="text-2xl font-black text-white tracking-tight">
              Verbatim Rubric Ratings & Candidate Quotes
            </h3>
          </div>
          <p className="text-xs text-slate-400 max-w-sm">
            Every score below is mathematically derived from candidate statements, verifiable with exact timestamps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {rubricEvidence.map((rubric, idx) => (
            <div
              key={idx}
              className="bg-slate-950/70 border border-white/5 hover:border-indigo-500/30 rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                    {rubric.criterion}
                  </h4>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-black ${
                      rubric.score >= 80
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : rubric.score >= 60
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {rubric.score} / 100
                  </span>
                </div>

                {/* Verbatim Quote Box */}
                <div
                  onClick={() => jumpToTimestamp(rubric.timestamp, rubric.verbatimQuote)}
                  className="bg-black/60 border border-indigo-500/20 hover:border-indigo-500/50 cursor-pointer rounded-xl p-3.5 space-y-1.5 transition-all group/quote"
                >
                  <div className="flex items-center justify-between text-[11px] text-indigo-400 font-bold uppercase tracking-wider">
                    <span className="flex items-center">
                      <Quote className="w-3.5 h-3.5 mr-1" />
                      Verbatim Quote
                    </span>
                    <span className="font-mono bg-indigo-500/10 px-2 py-0.5 rounded text-indigo-300">
                      {rubric.timestamp} (Click to Jump)
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 italic leading-relaxed">
                    "{rubric.verbatimQuote}"
                  </p>
                </div>

                {/* Reasoning */}
                <div className="text-xs text-slate-400 leading-relaxed pt-1">
                  <span className="font-bold text-slate-300">Auditor Evaluation: </span>
                  {rubric.reasoning}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

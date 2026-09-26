import React from 'react';
import { CandidateStudyTopic } from '@/types/athena';
import { Card } from '@/components/ui/card';
import {
  GraduationCap,
  BookOpen,
  Target,
  Sparkles,
  ExternalLink,
  Calendar,
  CheckCircle2,
  TrendingUp,
  Award
} from 'lucide-react';

interface CandidateGrowthCoachProps {
  studyTopics: CandidateStudyTopic[];
  overallScore: number;
  candidateName?: string;
}

export default function CandidateGrowthCoach({
  studyTopics = [],
  overallScore = 80,
  candidateName = 'Engineer'
}: CandidateGrowthCoachProps) {
  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500 font-sans">
      {/* Hero Growth Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-950/80 via-slate-900 to-slate-950 border border-indigo-500/20 rounded-3xl p-6 sm:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-black uppercase tracking-widest border border-emerald-500/20">
              <Award className="w-3.5 h-3.5 mr-1" />
              <span>HireRank Candidate Growth Coach</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Personalized Engineering Growth Plan
            </h2>
            <p className="text-slate-400 text-sm max-w-2xl font-medium">
              Interviews are learning milestones. Based on your live problem-solving and architectural choices, HireRank curated these targeted study topics to fast-track your seniority.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center shrink-0 min-w-[140px]">
            <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400">Readiness Score</span>
            <span className="text-4xl font-black text-white mt-1">{overallScore}%</span>
            <span className="text-[10px] text-emerald-400 font-semibold mt-1">High Technical Potential</span>
          </div>
        </div>
      </div>

      {/* Recommended Study Topics Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black text-white tracking-tight flex items-center">
              <BookOpen className="w-5 h-5 text-indigo-400 mr-2" />
              <span>Prioritized Study Topics</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Specific engineering concepts and architectural edge cases to review
            </p>
          </div>
          <span className="text-xs font-semibold text-indigo-300 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
            {studyTopics.length} Focus Areas
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {studyTopics.map((topic, index) => (
            <Card
              key={topic.id || index}
              className="bg-slate-900/80 border border-white/10 hover:border-indigo-500/30 rounded-3xl p-6 shadow-xl flex flex-col justify-between transition-all duration-300 group"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                      {topic.competency}
                    </span>
                    <h4 className="text-base font-bold text-white mt-2 group-hover:text-indigo-300 transition-colors">
                      {topic.topic}
                    </h4>
                  </div>

                  <span
                    className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shrink-0 ${
                      topic.priority === 'high'
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        : topic.priority === 'medium'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}
                  >
                    {topic.priority} priority
                  </span>
                </div>

                {/* Identified Gap */}
                <div className="bg-black/40 border border-white/5 rounded-2xl p-3.5 space-y-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400 flex items-center">
                    <Target className="w-3 h-3 mr-1" />
                    Observed Growth Area
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {topic.detectedGap}
                  </p>
                </div>

                {/* Recommended Hands-on Action */}
                <div className="space-y-1 pt-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1 text-emerald-400" />
                    Recommended Hands-on Action
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed font-medium">
                    {topic.recommendedAction}
                  </p>
                </div>

                {/* Curated Resources */}
                {topic.suggestedResources && topic.suggestedResources.length > 0 && (
                  <div className="pt-2 space-y-2 border-t border-white/5">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400">
                      Curated Study Material
                    </span>
                    <div className="space-y-1.5">
                      {topic.suggestedResources.map((res, rIdx) => (
                        <div
                          key={rIdx}
                          className="flex items-center justify-between bg-white/[0.02] border border-white/5 rounded-xl px-3 py-2 text-xs text-slate-300"
                        >
                          <div className="flex items-center space-x-2 truncate">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                            <span className="font-semibold truncate">{res.title}</span>
                          </div>
                          {res.urlHint && (
                            <span className="text-[11px] text-slate-400 font-mono ml-2 shrink-0">
                              {res.urlHint}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* 30-Day Engineering Roadmap Card */}
      <Card className="bg-slate-900/80 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white tracking-tight">
              30-Day Technical Mastery Roadmap
            </h3>
            <p className="text-xs text-slate-400">Structured cadence to turn feedback into practical expertise</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-950/70 border border-white/5 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-indigo-400">
              <span>Days 1 - 10</span>
              <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-[10px]">Deep Theory</span>
            </div>
            <h5 className="text-sm font-bold text-white">Core Edge Cases & Distributed Fundamentals</h5>
            <p className="text-xs text-slate-400 leading-relaxed">
              Study failure modes in the topics flagged above. Focus on network partitions, idempotency, and concurrent consistency.
            </p>
          </div>

          <div className="bg-slate-950/70 border border-white/5 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-indigo-400">
              <span>Days 11 - 20</span>
              <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-[10px]">Hands-On Build</span>
            </div>
            <h5 className="text-sm font-bold text-white">Explain-While-You-Build Prototypes</h5>
            <p className="text-xs text-slate-400 leading-relaxed">
              Implement working mini-projects directly addressing the detected gaps. Practice narrating design choices out loud while coding.
            </p>
          </div>

          <div className="bg-slate-950/70 border border-white/5 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-indigo-400">
              <span>Days 21 - 30</span>
              <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-[10px]">Mock Simulations</span>
            </div>
            <h5 className="text-sm font-bold text-white">Full-Pressure Mock Re-runs</h5>
            <p className="text-xs text-slate-400 leading-relaxed">
              Return to HireRank for timed adaptive sessions. Aim for a zero-marker visual integrity score and verifiable evidence citations.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

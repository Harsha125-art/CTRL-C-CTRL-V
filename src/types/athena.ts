export interface VerificationTopic {
  id: string;
  title: string;
  sourceClaim: string;
  competency: string;
  keyVerificationGoal: string;
  suggestedQuestions: string[];
}

export type ReviewMarkerType = 'face_missing' | 'multiple_faces' | 'tab_switch' | 'audio_anomaly';
export type ReviewMarkerSeverity = 'low' | 'medium' | 'high';

export interface ReviewMarker {
  id: string;
  timestamp: string; // e.g. "02:14"
  elapsedSeconds: number;
  type: ReviewMarkerType;
  label: string;
  severity: ReviewMarkerSeverity;
  details: string;
  resolved?: boolean;
}

export interface TranscriptTurn {
  id: string;
  speaker: 'interviewer' | 'candidate';
  timestamp: string; // "01:25"
  elapsedSeconds: number;
  text: string;
  codeSnippet?: string;
  competency?: string;
  questionIndex?: number;
}

export interface RubricEvidenceItem {
  criterion: string;
  score: number; // 0-100
  verbatimQuote: string;
  timestamp: string; // e.g. "03:42"
  reasoning: string;
  strengthOrGap: 'strength' | 'gap';
}

export interface CandidateStudyTopic {
  id: string;
  topic: string;
  competency: string;
  detectedGap: string;
  recommendedAction: string;
  suggestedResources: { title: string; type: 'documentation' | 'practice' | 'deep_dive'; urlHint?: string }[];
  priority: 'high' | 'medium' | 'low';
}

export interface AthenaCompetencyState {
  currentCompetency: string;
  followUpCount: number; // Max 2 follow-ups
  totalCompetenciesCompleted: number;
  activeTopicId?: string;
}

export interface InterviewSessionData {
  jobDescription: string;
  resumeText: string;
  verificationTopics: VerificationTopic[];
  transcript: TranscriptTurn[];
  reviewMarkers: ReviewMarker[];
  rubricEvidence: RubricEvidenceItem[];
  studyTopics: CandidateStudyTopic[];
  overallScore: number;
  triageStatus: 'pending' | 'hire' | 'hold' | 'next_round';
}

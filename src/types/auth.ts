import { ReviewMarker, TranscriptTurn, RubricEvidenceItem, CandidateStudyTopic } from './athena';

export type UserRole = 'recruiter' | 'candidate';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  company?: string;
}

export interface InterviewInvitation {
  id: string;
  token: string;
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
  jobDescription: string;
  resumeText?: string;
  keySkills: string[];
  invitedBy: string;
  invitedByEmail: string;
  companyName: string;
  customMessage?: string;
  createdAt: string;
  expiresAt: string;
  status: 'pending' | 'in_progress' | 'completed' | 'expired';
  sessionId?: string;
}

export interface CandidateSessionRecord {
  id: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
  date: string;
  overallScore: number;
  technicalScore: number;
  communicationScore: number;
  confidenceScore: number;
  reviewMarkers: ReviewMarker[];
  transcript: TranscriptTurn[];
  rubricEvidence: RubricEvidenceItem[];
  studyTopics: CandidateStudyTopic[];
  triageStatus: 'hire' | 'hold' | 'next_round' | 'pending';
  feedbackHistory?: any[];
  invitationId?: string;
}

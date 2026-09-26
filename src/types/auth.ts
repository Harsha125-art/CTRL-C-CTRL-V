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
}

import { CandidateSessionRecord } from '@/types/auth';

const STORAGE_KEY = 'hirerank_candidate_sessions_v2';

const INITIAL_CANDIDATES: CandidateSessionRecord[] = [];

export function getStoredCandidates(): CandidateSessionRecord[] {
  if (typeof window === 'undefined') return INITIAL_CANDIDATES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_CANDIDATES));
      return INITIAL_CANDIDATES;
    }
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_CANDIDATES;
  }
}

export function saveCandidateSession(session: CandidateSessionRecord): void {
  if (typeof window === 'undefined') return;
  try {
    const all = getStoredCandidates();
    // Update if exists or prepend
    const existingIndex = all.findIndex(c => c.id === session.id);
    if (existingIndex >= 0) {
      all[existingIndex] = session;
    } else {
      all.unshift(session);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch (e) {
    console.error('Failed to save candidate session to storage:', e);
  }
}

export function updateCandidateTriageStatus(
  candidateId: string,
  status: 'hire' | 'hold' | 'next_round' | 'pending'
): void {
  if (typeof window === 'undefined') return;
  try {
    const all = getStoredCandidates();
    const target = all.find(c => c.id === candidateId);
    if (target) {
      target.triageStatus = status;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    }
  } catch (e) {
    console.error('Failed to update candidate triage status:', e);
  }
}

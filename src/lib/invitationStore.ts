import { InterviewInvitation } from '@/types/auth';

const STORAGE_KEY = 'hirerank_invitations_v2';

const INITIAL_INVITATIONS: InterviewInvitation[] = [];

export function getStoredInvitations(): InterviewInvitation[] {
  if (typeof window === 'undefined') return INITIAL_INVITATIONS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_INVITATIONS));
      return INITIAL_INVITATIONS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_INVITATIONS;
  }
}

export function saveInvitation(invitation: InterviewInvitation): void {
  if (typeof window === 'undefined') return;
  try {
    const all = getStoredInvitations();
    const existingIdx = all.findIndex(i => i.id === invitation.id);
    if (existingIdx >= 0) {
      all[existingIdx] = invitation;
    } else {
      all.unshift(invitation);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch (e) {
    console.error('Failed to save invitation:', e);
  }
}

export function getInvitationById(id: string): InterviewInvitation | undefined {
  const all = getStoredInvitations();
  return all.find(i => i.id === id);
}

export function getInvitationByToken(token: string): InterviewInvitation | undefined {
  const all = getStoredInvitations();
  return all.find(i => i.token === token || i.id === token);
}

export function getCandidateInvitations(email?: string): InterviewInvitation[] {
  const all = getStoredInvitations();
  if (!email) return all;
  const cleanEmail = email.toLowerCase().trim();
  // Return invitations sent to this candidate or all if demo candidate
  return all.filter(
    i => i.candidateEmail.toLowerCase().trim() === cleanEmail || cleanEmail.includes('alex')
  );
}

export function updateInvitationStatus(
  id: string,
  status: 'pending' | 'in_progress' | 'completed' | 'expired',
  sessionId?: string
): void {
  if (typeof window === 'undefined') return;
  try {
    const all = getStoredInvitations();
    const target = all.find(i => i.id === id || i.token === id);
    if (target) {
      target.status = status;
      if (sessionId) target.sessionId = sessionId;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    }
  } catch (e) {
    console.error('Failed to update invitation status:', e);
  }
}

export function deleteInvitation(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    const all = getStoredInvitations().filter(i => i.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch (e) {
    console.error('Failed to delete invitation:', e);
  }
}


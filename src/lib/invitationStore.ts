import { InterviewInvitation } from '@/types/auth';

const STORAGE_KEY = 'hirerank_invitations_v1';

const INITIAL_INVITATIONS: InterviewInvitation[] = [
  {
    id: 'inv-101',
    token: 'tok-stripe-8821',
    candidateName: 'Alex Rivera',
    candidateEmail: 'alex.rivera@example.com',
    jobTitle: 'Senior Distributed Systems Engineer',
    companyName: 'Stripe Core Infrastructure',
    invitedBy: 'Sarah Jenkins',
    invitedByEmail: 'sarah.jenkins@techcorp.com',
    jobDescription: 'Design, build, and maintain low-latency financial transaction pipelines, idempotent ledger services, and zero-downtime distributed storage. Requires deep knowledge of distributed consensus, Kafka, Redis, and high-concurrency event loops.',
    resumeText: 'Alex Rivera - Senior Software Engineer with 6+ years specializing in distributed systems, real-time streaming with Apache Kafka, high-throughput Redis caching layers, and resilient microservices.',
    keySkills: ['Distributed Systems', 'Kafka', 'Redis Caching', 'PostgreSQL Partitioning', 'System Architecture'],
    customMessage: 'Hi Alex, our engineering team reviewed your background in high-throughput event processing and would love to evaluate you for our Core Infrastructure team.',
    createdAt: '2026-09-24T10:00:00Z',
    expiresAt: '2026-10-01T23:59:59Z',
    status: 'pending'
  },
  {
    id: 'inv-102',
    token: 'tok-scale-4419',
    candidateName: 'Alex Rivera',
    candidateEmail: 'alex.rivera@example.com',
    jobTitle: 'Lead Fullstack Platform Engineer',
    companyName: 'Anthropic Cloud Platform',
    invitedBy: 'Marcus Vance',
    invitedByEmail: 'marcus.v@anthropic-talent.io',
    jobDescription: 'Build next-generation developer tooling, streaming evaluation suites, and high-performance WebSockets client interfaces for large language model inference clusters.',
    resumeText: 'Fullstack Platform Engineer experienced in Next.js, Node.js, WebSockets real-time sync, Monaco editor integration, and edge compute runtimes.',
    keySkills: ['Next.js / React', 'WebSockets', 'TypeScript', 'Monaco Editor', 'API Performance'],
    customMessage: 'Your experience with low-latency client interfaces and audio/video streaming aligns directly with our platform mission.',
    createdAt: '2026-09-25T14:30:00Z',
    expiresAt: '2026-10-02T23:59:59Z',
    status: 'pending'
  },
  {
    id: 'inv-103',
    token: 'tok-linear-7712',
    candidateName: 'Priya Sharma',
    candidateEmail: 'priya.sharma@example.com',
    jobTitle: 'Staff Backend Reliability Engineer',
    companyName: 'Linear Systems',
    invitedBy: 'Sarah Jenkins',
    invitedByEmail: 'sarah.jenkins@techcorp.com',
    jobDescription: 'Responsible for 99.999% reliability, incident automated remediation, distributed tracing, and database replication health across multiple cloud zones.',
    keySkills: ['Kubernetes', 'Go / Python', 'Distributed Tracing', 'SRE / Resilience'],
    customMessage: 'Priya, your work in automated cluster failover is exactly what we need for our scaling phase.',
    createdAt: '2026-09-23T09:15:00Z',
    expiresAt: '2026-09-30T23:59:59Z',
    status: 'completed',
    sessionId: 'cand-002'
  }
];

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

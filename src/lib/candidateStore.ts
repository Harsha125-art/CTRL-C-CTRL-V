import { CandidateSessionRecord } from '@/types/auth';

const STORAGE_KEY = 'hirerank_candidate_sessions_v1';

const INITIAL_CANDIDATES: CandidateSessionRecord[] = [
  {
    id: 'cand-001',
    candidateId: 'cand-001',
    candidateName: 'Alex Chen',
    candidateEmail: 'alex.chen@example.com',
    jobTitle: 'Senior Fullstack Engineer',
    date: '2026-09-25',
    overallScore: 88,
    technicalScore: 90,
    communicationScore: 85,
    confidenceScore: 89,
    triageStatus: 'hire',
    reviewMarkers: [
      {
        id: 'marker-1',
        timestamp: '03:15',
        elapsedSeconds: 195,
        type: 'tab_switch',
        label: 'Tab Unfocused / Backgrounded',
        severity: 'low',
        details: 'Candidate switched tabs briefly to check documentation; returned in 3s.'
      }
    ],
    transcript: [
      {
        id: 'turn-1',
        speaker: 'interviewer',
        timestamp: '00:00',
        elapsedSeconds: 0,
        text: 'To begin, could you walk me through the architecture of your distributed real-time chat platform?',
        competency: 'System Architecture & Design'
      },
      {
        id: 'turn-2',
        speaker: 'candidate',
        timestamp: '01:10',
        elapsedSeconds: 70,
        text: 'We separated the WebSocket connection state into an ephemeral Redis cluster while persisting message history asynchronously via Kafka into PostgreSQL partitioned by channel ID.',
        competency: 'System Architecture & Design'
      },
      {
        id: 'turn-3',
        speaker: 'interviewer',
        timestamp: '02:05',
        elapsedSeconds: 125,
        text: 'How did you handle WebSocket node failovers when hundreds of thousands of concurrent connections reconnect simultaneously?',
        competency: 'System Architecture & Design'
      },
      {
        id: 'turn-4',
        speaker: 'candidate',
        timestamp: '03:30',
        elapsedSeconds: 210,
        text: 'We configured client-side exponential backoff with full jitter and placed an Envoy proxy upstream with connection rate-limiting rings to prevent thundering herd crashes.',
        competency: 'Production Resilience'
      }
    ],
    rubricEvidence: [
      {
        criterion: 'System Architecture & Design',
        score: 92,
        verbatimQuote: 'We separated the WebSocket connection state into an ephemeral Redis cluster while persisting message history asynchronously via Kafka.',
        timestamp: '01:10',
        reasoning: 'Clean decoupling of stateful socket connections from durable message logs with appropriate storage tiers.',
        strengthOrGap: 'strength'
      },
      {
        criterion: 'Production Resilience & Operational Thinking',
        score: 88,
        verbatimQuote: 'We configured client-side exponential backoff with full jitter and placed an Envoy proxy upstream with connection rate-limiting rings.',
        timestamp: '03:30',
        reasoning: 'Demonstrated precise knowledge of thundering herd mitigation under sudden reconnection spikes.',
        strengthOrGap: 'strength'
      }
    ],
    studyTopics: [
      {
        id: 'st-1',
        topic: 'Kafka Consumer Lag Telemetry & Rebalancing Pitfalls',
        competency: 'Data Streaming',
        detectedGap: 'Did not specify how consumer rebalance timeouts affect end-to-end chat latency.',
        recommendedAction: 'Simulate cooperative sticky rebalances in a local 3-node Kafka cluster.',
        suggestedResources: [{ title: 'Kafka: The Definitive Guide (Ch 4)', type: 'deep_dive' }],
        priority: 'medium'
      }
    ],
    feedbackHistory: [
      {
        question: 'Walk through your distributed real-time chat platform architecture.',
        evaluation: 'Exceptional architectural framing with clean separation of concerns.',
        score: 90,
        transcribedText: 'We separated the WebSocket connection state into an ephemeral Redis cluster while persisting message history asynchronously via Kafka.'
      }
    ]
  },
  {
    id: 'cand-002',
    candidateId: 'cand-002',
    candidateName: 'Priya Sharma',
    candidateEmail: 'priya.sharma@example.com',
    jobTitle: 'Distributed Systems Architect',
    date: '2026-09-24',
    overallScore: 92,
    technicalScore: 94,
    communicationScore: 90,
    confidenceScore: 92,
    triageStatus: 'next_round',
    reviewMarkers: [],
    transcript: [
      {
        id: 'turn-1',
        speaker: 'interviewer',
        timestamp: '00:00',
        elapsedSeconds: 0,
        text: 'How do you structure database sharding keys to avoid hot-spotting on multi-tenant SaaS platforms?',
        competency: 'Database Architecture'
      },
      {
        id: 'turn-2',
        speaker: 'candidate',
        timestamp: '01:20',
        elapsedSeconds: 80,
        text: 'We composite the organization UUID with a truncated monthly timestamp hash to balance uniform distribution with predictable ranged queries.',
        competency: 'Database Architecture'
      }
    ],
    rubricEvidence: [
      {
        criterion: 'Database Scaling & Partitioning',
        score: 95,
        verbatimQuote: 'We composite the organization UUID with a truncated monthly timestamp hash to balance uniform distribution.',
        timestamp: '01:20',
        reasoning: 'Addresses both skew hot-spotting and time-series pruning natively at the sharding tier.',
        strengthOrGap: 'strength'
      }
    ],
    studyTopics: [
      {
        id: 'st-2',
        topic: 'Cross-Shard Transaction Atomicity via Two-Phase Commit',
        competency: 'Distributed Data',
        detectedGap: 'Omitted mention of lock recovery during coordinator failure in 2PC.',
        recommendedAction: 'Study Spanner TrueTime or Raft-backed distributed transactions.',
        suggestedResources: [{ title: 'Google Spanner Paper', type: 'deep_dive' }],
        priority: 'low'
      }
    ],
    feedbackHistory: [
      {
        question: 'Database sharding keys for multi-tenant SaaS.',
        evaluation: 'Superior depth in partition key mechanics.',
        score: 94,
        transcribedText: 'We composite the organization UUID with a truncated monthly timestamp hash.'
      }
    ]
  },
  {
    id: 'cand-003',
    candidateId: 'cand-003',
    candidateName: 'Marcus Vance',
    candidateEmail: 'marcus.vance@example.com',
    jobTitle: 'Frontend & UI Performance Lead',
    date: '2026-09-22',
    overallScore: 74,
    technicalScore: 72,
    communicationScore: 78,
    confidenceScore: 72,
    triageStatus: 'hold',
    reviewMarkers: [
      {
        id: 'marker-3',
        timestamp: '02:40',
        elapsedSeconds: 160,
        type: 'face_missing',
        label: 'Face Missing / Out of Frame',
        severity: 'medium',
        details: 'Candidate stepped out of camera view for 12 seconds during answer preparation.'
      }
    ],
    transcript: [
      {
        id: 'turn-1',
        speaker: 'interviewer',
        timestamp: '00:00',
        elapsedSeconds: 0,
        text: 'What strategies do you deploy to optimize Next.js Interaction to Next Paint (INP) under 100ms?',
        competency: 'Web Performance'
      },
      {
        id: 'turn-2',
        speaker: 'candidate',
        timestamp: '01:40',
        elapsedSeconds: 100,
        text: 'We break long tasks using scheduler.yield and transition heavy table recalculations into web workers.',
        competency: 'Web Performance'
      }
    ],
    rubricEvidence: [
      {
        criterion: 'Frontend Runtime Performance',
        score: 75,
        verbatimQuote: 'We break long tasks using scheduler.yield and transition heavy table recalculations into web workers.',
        timestamp: '01:40',
        reasoning: 'Good modern API awareness, but lacked depth in hydration overhead breakdown.',
        strengthOrGap: 'gap'
      }
    ],
    studyTopics: [
      {
        id: 'st-3',
        topic: 'React 18 Concurrent Rendering & Server Component Streaming',
        competency: 'Frontend Architecture',
        detectedGap: 'Confused streaming SSR chunk boundary resolution with hydration tree reconciliation.',
        recommendedAction: 'Profile bundle tree size and render passes using React DevTools Profiler.',
        suggestedResources: [{ title: 'Web.dev INP Optimization Guide', type: 'documentation' }],
        priority: 'high'
      }
    ],
    feedbackHistory: [
      {
        question: 'Optimizing Next.js INP under 100ms.',
        evaluation: 'Identified scheduler.yield but needed deeper explanation of hydration cost.',
        score: 72,
        transcribedText: 'We break long tasks using scheduler.yield and transition heavy table recalculations into web workers.'
      }
    ]
  }
];

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

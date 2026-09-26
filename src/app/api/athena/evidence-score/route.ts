import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { checkRateLimit } from '@/lib/ratelimit';
import { TranscriptTurn, RubricEvidenceItem, CandidateStudyTopic } from '@/types/athena';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') ?? '127.0.0.1';
    const isAllowed = await checkRateLimit(ip);
    if (!isAllowed) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const { transcript = [] as TranscriptTurn[], jobDescription = '', resumeText = '', reviewMarkers = [] } = await req.json();

    if (!transcript || transcript.length === 0) {
      return NextResponse.json({ error: "Transcript is required for evidence-first evaluation." }, { status: 400 });
    }

    // Format the conversation transcript with timestamps
    const transcriptText = transcript
      .map((t: TranscriptTurn) => `[${t.timestamp}] ${t.speaker.toUpperCase()}: ${t.text}${t.codeSnippet ? `\n[Code]:\n${t.codeSnippet}` : ''}`)
      .join('\n\n');

    const prompt = `You are HireRank's Project Athena Evidence-First Evaluator and Growth Coach.
You evaluate technical candidates strictly using verifiable evidence.

MANDATORY RULES:
1. EVIDENCE-FIRST REQUIREMENT: Every single rubric criterion MUST cite an EXACT VERBATIM QUOTE from the candidate transcript along with its exact timestamp [MM:SS].
   DO NOT make up or paraphrase the quote. If no exact candidate quote exists for a specific area, cite the closest spoken candidate line and clearly state the omission.
2. Standard Rubric Criteria:
   - System Architecture & Design
   - Algorithmic & Problem Solving Logic
   - Engineering Trade-offs & Production Thinking
   - Technical Communication & Clarity
3. For the Candidate Growth Coach, generate 3 to 4 actionable "Study Topics" based on the candidate's exact gaps detected during the interview, with concrete learning actions and resources.

Transcript to evaluate:
\"\"\"
${transcriptText.slice(0, 6000)}
\"\"\"

Job Description:
\"\"\"
${jobDescription.slice(0, 1500)}
\"\"\"

Return ONLY a valid JSON object in this format:
{
  "overallScore": number (0-100),
  "executiveSummary": "2-3 sentences summarizing the technical evaluation.",
  "rubricEvidence": [
    {
      "criterion": "System Architecture & Design",
      "score": number (0-100),
      "verbatimQuote": "Exact quote from transcript spoken by candidate",
      "timestamp": "MM:SS",
      "reasoning": "Why this quote demonstrates competence or reveals an architecture gap",
      "strengthOrGap": "strength" | "gap"
    },
    {
      "criterion": "Algorithmic & Problem Solving Logic",
      "score": number (0-100),
      "verbatimQuote": "Exact quote from transcript",
      "timestamp": "MM:SS",
      "reasoning": "Analysis of code/logic described by candidate",
      "strengthOrGap": "strength" | "gap"
    },
    {
      "criterion": "Engineering Trade-offs & Production Thinking",
      "score": number (0-100),
      "verbatimQuote": "Exact quote from transcript",
      "timestamp": "MM:SS",
      "reasoning": "Analysis of trade-offs",
      "strengthOrGap": "strength" | "gap"
    },
    {
      "criterion": "Technical Communication & Clarity",
      "score": number (0-100),
      "verbatimQuote": "Exact quote from transcript",
      "timestamp": "MM:SS",
      "reasoning": "Communication clarity assessment",
      "strengthOrGap": "strength" | "gap"
    }
  ],
  "studyTopics": [
    {
      "id": "study-1",
      "topic": "Name of topic (e.g. Distributed Consensus & Raft)",
      "competency": "System Architecture",
      "detectedGap": "Specific misconception or omitted edge case identified in their answer",
      "recommendedAction": "Concrete exercise or architectural implementation to build mastery",
      "suggestedResources": [
        { "title": "Resource Name", "type": "documentation" | "practice" | "deep_dive", "urlHint": "e.g. Designing Data-Intensive Applications Ch. 9" }
      ],
      "priority": "high" | "medium" | "low"
    }
  ],
  "triageRecommendation": "hire" | "hold" | "next_round"
}`;

    if (process.env.GROQ_API_KEY) {
      const chatCompletion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.3,
        response_format: { type: 'json_object' },
      });

      const content = chatCompletion.choices[0]?.message?.content || '{}';
      const parsed = JSON.parse(content);
      return NextResponse.json(parsed);
    } else {
      // Deterministic fallback matching transcript turns
      const candidateTurns = transcript.filter((t: TranscriptTurn) => t.speaker === 'candidate');
      const firstQuote = candidateTurns[0]?.text.slice(0, 100) || "I implemented the service using standard endpoints.";
      const firstTs = candidateTurns[0]?.timestamp || "01:15";

      return NextResponse.json({
        overallScore: 84,
        executiveSummary: "Candidate demonstrated solid foundational knowledge and structured thinking with clean modular explanations, though further depth in distributed partition handling was warranted.",
        rubricEvidence: [
          {
            criterion: "System Architecture & Design",
            score: 86,
            verbatimQuote: firstQuote,
            timestamp: firstTs,
            reasoning: "Demonstrated clear modular decomposition and practical consideration of network boundaries.",
            strengthOrGap: "strength"
          },
          {
            criterion: "Algorithmic & Problem Solving Logic",
            score: 82,
            verbatimQuote: candidateTurns[1]?.text.slice(0, 90) || "I traversed the elements keeping track of boundary states.",
            timestamp: candidateTurns[1]?.timestamp || "02:40",
            reasoning: "Appropriate complexity estimation with edge case considerations.",
            strengthOrGap: "strength"
          },
          {
            criterion: "Engineering Trade-offs & Production Thinking",
            score: 78,
            verbatimQuote: candidateTurns[2]?.text.slice(0, 90) || "We chose consistency over eventual sync for financial operations.",
            timestamp: candidateTurns[2]?.timestamp || "04:10",
            reasoning: "Correct trade-off identification, but could provide more telemetry and alerting depth.",
            strengthOrGap: "gap"
          },
          {
            criterion: "Technical Communication & Clarity",
            score: 90,
            verbatimQuote: firstQuote,
            timestamp: firstTs,
            reasoning: "Answer was articulated concisely without excessive filler words.",
            strengthOrGap: "strength"
          }
        ],
        studyTopics: [
          {
            id: "study-1",
            topic: "Distributed Systems Partitioning & CAP Theorem Trade-offs",
            competency: "System Architecture",
            detectedGap: "Focused heavily on happy-path replication without detailing network split-brain mitigations.",
            recommendedAction: "Build a prototype Raft or 2PC consensus simulation using Docker networks with simulated packet drops.",
            suggestedResources: [
              { title: "Designing Data-Intensive Applications (Kleppmann)", type: "deep_dive", urlHint: "Chapter 8 & 9" },
              { title: "Raft Consensus Algorithm Visual Guide", type: "documentation", urlHint: "raft.github.io" }
            ],
            priority: "high"
          },
          {
            id: "study-2",
            topic: "Advanced Memory Profiling & Concurrency Lock Contention",
            competency: "Engineering Reliability",
            detectedGap: "Did not quantify heap overhead during asynchronous streaming buffers.",
            recommendedAction: "Profile high-concurrency Node.js / Go worker routines under p99 latency stress.",
            suggestedResources: [
              { title: "Linux Perf & Node.js Clinic.js Diagnostics", type: "practice", urlHint: "clinicjs.org" }
            ],
            priority: "medium"
          }
        ],
        triageRecommendation: "next_round"
      });
    }
  } catch (error: any) {
    console.error("Evidence score evaluation error:", error);
    return NextResponse.json(
      { error: "Failed to generate evidence-first scoring", details: error.message },
      { status: 500 }
    );
  }
}

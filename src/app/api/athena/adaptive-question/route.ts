import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/ratelimit';
import { AthenaCompetencyState, VerificationTopic } from '@/types/athena';
import { createGroqChatCompletion } from '@/lib/groq';

const DEFAULT_COMPETENCIES = [
  'System Architecture & Design',
  'Algorithmic Problem Solving & Code Execution',
  'Production Resilience & Operational Judgment',
  'Domain Competency & Practical Trade-offs'
];

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') ?? '127.0.0.1';
    const isAllowed = await checkRateLimit(ip);
    if (!isAllowed) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const body = await req.json();
    const {
      previousQuestion = '',
      previousAnswer = '',
      codeContent,
      jobDescription = '',
      resumeText = '',
      askedQuestions = [] as string[],
      verificationTopics = [] as VerificationTopic[],
      competencyState = {
        currentCompetency: DEFAULT_COMPETENCIES[0],
        followUpCount: 0,
        totalCompetenciesCompleted: 0
      } as AthenaCompetencyState,
      questionIndex = 1
    } = body;

    let { currentCompetency, followUpCount, totalCompetenciesCompleted } = competencyState;

    let shouldRotateCompetency = false;
    let nextFollowUpCount = followUpCount;

    // Rotate after 2 follow-ups
    if (followUpCount >= 2) {
      shouldRotateCompetency = true;
      totalCompetenciesCompleted += 1;
      const nextIndex = totalCompetenciesCompleted % DEFAULT_COMPETENCIES.length;
      currentCompetency = DEFAULT_COMPETENCIES[nextIndex];
      nextFollowUpCount = 0;
    } else {
      nextFollowUpCount = followUpCount + 1;
    }

    // Force coding question at Question 3 or 4
    const isCodingStage = questionIndex === 3 || currentCompetency.includes('Algorithmic');

    const allAsked = [previousQuestion, ...askedQuestions].filter(Boolean);

    // Extract any mentioned keywords from previous answer
    const cleanedAnswer = previousAnswer && previousAnswer !== 'No audio recorded.' ? previousAnswer : '';

    const prompt = `You are HireRank's Adaptive Question Engine.
You must generate the NEXT technical interview question based on the candidate's actual words, their demonstrated skills, and the Job Description.

CRITICAL RULES:
1. NEVER REPEAT: You are FORBIDDEN from asking or repeating any question similar to these previous questions:
${allAsked.map((q, i) => `   ${i + 1}. "${q}"`).join('\n')}

2. ADAPTIVE BRANCHING:
   - If the candidate mentioned specific tools or patterns (e.g. Docker, Redis, Postgres, React, Microservices, Kafka, WebSockets, Sharding) in their answer: """${cleanedAnswer}""", DIRECTLY challenge or drill into how they implemented it or how they handle failure modes in that choice!
   - If their previous answer was brief or vague, ask them to justify the database or consistency trade-offs.
   - For Question ${questionIndex + 1} of 5:
     ${questionIndex === 0 ? '- Ask an icebreaker about a specific project or core technology listed on their resume.' : ''}
     ${questionIndex === 1 ? '- Drill deep into data models, latency bottlenecks, and state management in their architecture.' : ''}
     ${questionIndex === 2 ? '- Coding & Algorithmic Task: Present a concrete coding scenario to implement in Python or JavaScript.' : ''}
     ${questionIndex === 3 ? '- Production Incident / Scalability: Ask how they handle network drops, concurrency lock contention, or traffic spikes.' : ''}
     ${questionIndex >= 4 ? '- High-level architectural trade-offs, security, and cost optimization.' : ''}

Job Description:
"""${jobDescription.slice(0, 1200)}"""

Candidate Resume Details:
"""${resumeText.slice(0, 1500)}"""

Return ONLY a valid JSON object:
{
  "nextQuestion": "The unique, concrete question for the candidate.",
  "isCodingQuestion": ${isCodingStage ? 'true' : 'false'},
  "difficulty": "medium",
  "competency": "${currentCompetency}",
  "followUpCount": ${nextFollowUpCount},
  "isNewCompetency": ${shouldRotateCompetency},
  "rationale": "Why this specific question was selected based on candidate's answer."
}`;

    let parsed: any = null;

    if (process.env.GROQ_API_KEY) {
      try {
        const chatCompletion = await createGroqChatCompletion({
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.6,
          response_format: { type: 'json_object' },
        });

        const content = chatCompletion.choices[0]?.message?.content || '{}';
        parsed = JSON.parse(content);

        // Sanity check: Ensure generated question is not identical to previous questions
        if (parsed?.nextQuestion && allAsked.some(prev => prev.toLowerCase().includes(parsed.nextQuestion.toLowerCase().slice(0, 40)))) {
          parsed = null; // force fresh question
        }
      } catch (aiErr) {
        console.warn("Groq adaptive question generation failed, using stage-specific fallback:", aiErr);
      }
    }

    // Dynamic stage-aware fallback questions that NEVER repeat
    if (!parsed || !parsed.nextQuestion) {
      const stageFallbackMatrix: { [stage: number]: { question: string; isCoding: boolean; comp: string } } = {
        1: {
          question: "Can you dive into the data layer of that project? How did you structure your schema and indexing to ensure sub-millisecond query response times?",
          isCoding: false,
          comp: "Database Design & State"
        },
        2: {
          question: "When traffic spikes 10x or connections pool out, how does your system handle backpressure and rate limiting? What telemetry alarms notify your team?",
          isCoding: false,
          comp: "Production Resilience"
        },
        3: {
          question: "Let's test implementation skills in the code editor: Write a function to detect cycle dependencies in a directed acyclic graph (DAG) representing service tasks.",
          isCoding: true,
          comp: "Algorithmic Problem Solving & Code Execution"
        },
        4: {
          question: "Suppose a production database replica experiences a 30-second network partition during peak financial transactions. How do you reconcile conflicting writes without data corruption?",
          isCoding: false,
          comp: "Distributed Systems & Consistency"
        },
        5: {
          question: "Looking back at the end-to-end architecture, what is the single largest technical debt or single point of failure you would re-architect if given unlimited budget?",
          isCoding: false,
          comp: "System Architecture & Design"
        }
      };

      const fallbackEntry = stageFallbackMatrix[Math.min(questionIndex, 5)] || stageFallbackMatrix[2];

      parsed = {
        nextQuestion: fallbackEntry.question,
        isCodingQuestion: fallbackEntry.isCoding,
        difficulty: "medium",
        competency: fallbackEntry.comp,
        followUpCount: nextFollowUpCount,
        isNewCompetency: true,
        rationale: `Stage ${questionIndex} progressive skill verification.`
      };
    }

    return NextResponse.json({
      ...parsed,
      updatedCompetencyState: {
        currentCompetency: parsed.competency || currentCompetency,
        followUpCount: nextFollowUpCount,
        totalCompetenciesCompleted,
        activeTopicId: verificationTopics[0]?.id
      }
    });
  } catch (error: any) {
    console.error("Adaptive question error:", error);
    return NextResponse.json(
      { error: "Failed to generate adaptive question", details: error.message },
      { status: 500 }
    );
  }
}

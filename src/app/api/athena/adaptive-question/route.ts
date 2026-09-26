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
      previousQuestion,
      previousAnswer,
      codeContent,
      jobDescription = '',
      resumeText = '',
      verificationTopics = [] as VerificationTopic[],
      competencyState = {
        currentCompetency: DEFAULT_COMPETENCIES[0],
        followUpCount: 0,
        totalCompetenciesCompleted: 0
      } as AthenaCompetencyState,
      questionIndex = 0
    } = body;

    let { currentCompetency, followUpCount, totalCompetenciesCompleted } = competencyState;

    let shouldRotateCompetency = false;
    let nextFollowUpCount = followUpCount;

    // Backend limit: Max 2 follow-ups per competency
    if (followUpCount >= 2) {
      shouldRotateCompetency = true;
      totalCompetenciesCompleted += 1;
      const nextIndex = totalCompetenciesCompleted % DEFAULT_COMPETENCIES.length;
      currentCompetency = DEFAULT_COMPETENCIES[nextIndex];
      nextFollowUpCount = 0;
    } else {
      nextFollowUpCount = followUpCount + 1;
    }

    // Determine relevant verification topic if available
    const activeTopic = verificationTopics.find((t: VerificationTopic) =>
      t.competency?.toLowerCase().includes(currentCompetency.toLowerCase()) ||
      currentCompetency.toLowerCase().includes(t.competency?.toLowerCase())
    ) || verificationTopics[totalCompetenciesCompleted % (verificationTopics.length || 1)];

    const prompt = `You are HireRank's Project Athena Adaptive Question Engine.
Your goal is to conduct an authentic, responsive technical interview.

CURRENT INTERVIEW STATUS:
- Target Competency: "${currentCompetency}"
- Follow-up Depth on this Competency: ${nextFollowUpCount} of 2 max follow-ups
- Is Fresh Competency Transition: ${shouldRotateCompetency}
- Active Resume Verification Topic: ${activeTopic ? `"${activeTopic.title}" (Source: ${activeTopic.sourceClaim})` : 'General JD requirement'}

CONTEXT:
Job Description: """${jobDescription.slice(0, 1500)}"""
Candidate's Previous Answer: """${previousAnswer || 'Starting initial question.'}"""
${codeContent ? `Candidate's Submitted Code: """${codeContent.slice(0, 800)}"""` : ''}
Previous Question: """${previousQuestion || 'N/A'}"""

RULES:
1. If "Is Fresh Competency Transition" is TRUE (or starting first question):
   - Transition cleanly to the new competency ("${currentCompetency}").
   - Frame a new problem or architecture scenario grounded in the candidate's resume claims or the job requirements.
2. If "Is Fresh Competency Transition" is FALSE (Follow-up 1 or 2):
   - Actively BRANCH from the candidate's actual words in their previous answer!
   - If they mentioned a specific technology, design decision, edge case, or trade-off, challenge it or drill into the failure modes.
   - If their answer was vague or missed a critical concept, ask a targeted follow-up question to probe for deep comprehension.
3. If competency is "Algorithmic Problem Solving & Code Execution", set "isCodingQuestion": true.

Return ONLY a valid JSON object:
{
  "nextQuestion": "The clear, spoken-style interview question for the candidate.",
  "isCodingQuestion": boolean,
  "difficulty": "easy" | "medium" | "hard",
  "competency": "${currentCompetency}",
  "followUpCount": ${nextFollowUpCount},
  "isNewCompetency": ${shouldRotateCompetency},
  "rationale": "One brief sentence explaining why this question was chosen based on the candidate's previous response and competency limits."
}`;

    let parsed: any = null;

    if (process.env.GROQ_API_KEY) {
      try {
        const chatCompletion = await createGroqChatCompletion({
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.5,
          response_format: { type: 'json_object' },
        });

        const content = chatCompletion.choices[0]?.message?.content || '{}';
        parsed = JSON.parse(content);
      } catch (aiErr) {
        console.warn("Groq adaptive question generation failed, falling back to heuristic engine:", aiErr);
      }
    }

    if (parsed && parsed.nextQuestion) {
      return NextResponse.json({
        ...parsed,
        updatedCompetencyState: {
          currentCompetency,
          followUpCount: nextFollowUpCount,
          totalCompetenciesCompleted,
          activeTopicId: activeTopic?.id
        }
      });
    } else {
      // Deterministic fallback if running without Groq key
      const fallbackIsCoding = currentCompetency.includes('Coding') || currentCompetency.includes('Algorithmic');
      return NextResponse.json({
        nextQuestion: shouldRotateCompetency
          ? `Let's shift focus to ${currentCompetency}. In your previous projects, how did you architect systems for high availability under peak load?`
          : `You mentioned that in your response. How would that approach scale if your traffic increased 10x or if the network partitioned?`,
        isCodingQuestion: fallbackIsCoding,
        difficulty: 'medium',
        competency: currentCompetency,
        followUpCount: nextFollowUpCount,
        isNewCompetency: shouldRotateCompetency,
        rationale: shouldRotateCompetency
          ? 'Reached 2 follow-ups ceiling on previous competency; rotated to next topic.'
          : `Adaptive follow-up ${nextFollowUpCount}/2 probing candidate's design rationale.`,
        updatedCompetencyState: {
          currentCompetency,
          followUpCount: nextFollowUpCount,
          totalCompetenciesCompleted,
          activeTopicId: activeTopic?.id
        }
      });
    }
  } catch (error: any) {
    console.error("Adaptive question error:", error);
    return NextResponse.json(
      { error: "Failed to generate adaptive question", details: error.message },
      { status: 500 }
    );
  }
}

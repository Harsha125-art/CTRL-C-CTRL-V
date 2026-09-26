import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/ratelimit';
import { VerificationTopic } from '@/types/athena';
import { createGroqChatCompletion } from '@/lib/groq';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') ?? '127.0.0.1';
    const isAllowed = await checkRateLimit(ip);
    if (!isAllowed) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const { resumeText, jobDescription } = await req.json();

    if (!resumeText || !jobDescription) {
      return NextResponse.json({ error: "Both resume text and job description are required." }, { status: 400 });
    }

    const prompt = `You are HireRank's Project Athena Resume-to-Reality Engine.
Analyze the following Job Description and Candidate's Resume.
Extract the key project claims, technical competencies, and architectural choices mentioned in the resume that directly intersect with the job requirements.
Then formulate EXACTLY THREE (3) realistic "Verification Topics" that the candidate will review and that will form the spine of the technical interview.

Return ONLY a valid JSON object with the following schema:
{
  "projectClaims": [
    "Key claim 1 extracted verbatim or summarized from resume",
    "Key claim 2 extracted from resume",
    "Key claim 3 extracted from resume"
  ],
  "verificationTopics": [
    {
      "id": "topic-1",
      "title": "Concise title (e.g. Distributed Caching & Redis Eviction Policies)",
      "sourceClaim": "The resume claim it verifies (e.g. 'Engineered high-throughput caching layer with Redis')",
      "competency": "Domain (e.g. System Design, Backend Engineering, Cloud Architecture)",
      "keyVerificationGoal": "What the interviewer will probe to verify genuine ownership vs theoretical knowledge",
      "suggestedQuestions": [
        "Primary verification question",
        "Technical deep-dive follow-up"
      ]
    },
    {
      "id": "topic-2",
      "title": "Topic 2 Title",
      "sourceClaim": "Source claim 2 from resume",
      "competency": "Competency 2",
      "keyVerificationGoal": "Verification goal 2",
      "suggestedQuestions": [
        "Primary verification question",
        "Technical deep-dive follow-up"
      ]
    },
    {
      "id": "topic-3",
      "title": "Topic 3 Title",
      "sourceClaim": "Source claim 3 from resume",
      "competency": "Competency 3",
      "keyVerificationGoal": "Verification goal 3",
      "suggestedQuestions": [
        "Primary verification question",
        "Technical deep-dive follow-up"
      ]
    }
  ]
}

Job Description:
"""${jobDescription.slice(0, 3000)}"""

Candidate Resume Text:
"""${resumeText.slice(0, 4000)}"""`;

    let result: { projectClaims: string[]; verificationTopics: VerificationTopic[] } | null = null;

    if (process.env.GROQ_API_KEY) {
      try {
        const chatCompletion = await createGroqChatCompletion({
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3,
          response_format: { type: 'json_object' },
        });

        const content = chatCompletion.choices[0]?.message?.content || '{}';
        result = JSON.parse(content);
      } catch (aiErr) {
        console.warn("Groq claim extraction failed, falling back to deterministic claims:", aiErr);
      }
    }

    if (!result || !result.verificationTopics || result.verificationTopics.length === 0) {
      // Fallback deterministic generator if API key is in local demo mode
      result = {
        projectClaims: [
          "Developed full-stack web applications and scalable API services",
          "Implemented database models and optimized query latency",
          "Collaborated in agile development and deployed cloud infrastructure"
        ],
        verificationTopics: [
          {
            id: "topic-1",
            title: "Core Architecture & Data Flow",
            sourceClaim: "Built high-performance microservices and API gateways",
            competency: "System Architecture",
            keyVerificationGoal: "Verify candidate's hands-on understanding of request lifecycle, data consistency, and edge failure modes",
            suggestedQuestions: [
              "Can you walk me through the end-to-end architecture of your most impactful project?",
              "What trade-offs did you make between consistency and availability?"
            ]
          },
          {
            id: "topic-2",
            title: "Algorithm Implementation & State Management",
            sourceClaim: "Engineered responsive client state and algorithm pipelines",
            competency: "Code Implementation",
            keyVerificationGoal: "Assess coding speed, edge case mitigation, and time/space complexity optimization",
            suggestedQuestions: [
              "How did you structure the state and maintain predictable updates under load?",
              "What was the algorithmic bottleneck and how did you profile it?"
            ]
          },
          {
            id: "topic-3",
            title: "Production Resilience & Incident Handling",
            sourceClaim: "Managed deployment pipelines, telemetry, and debugging in staging/production",
            competency: "Engineering Reliability",
            keyVerificationGoal: "Evaluate real-world production readiness, monitoring strategy, and error recovery instincts",
            suggestedQuestions: [
              "Describe a production incident or silent bug you debugged. How did you isolate root cause?",
              "What monitoring alarms or rate-limiting guards did you introduce?"
            ]
          }
        ]
      };
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error extracting resume claims:", error);
    return NextResponse.json(
      { error: "Failed to extract verification claims", details: error.message },
      { status: 500 }
    );
  }
}

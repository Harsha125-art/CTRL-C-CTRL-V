import { NextRequest, NextResponse } from 'next/server';
import { createGroqChatCompletion } from '@/lib/groq';

export async function POST(req: NextRequest) {
  try {
    const { question } = await req.json();

    if (!question) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 });
    }

    const prompt = `You are an expert AI technical interviewer. 
The candidate is currently struggling with this interview question:
"${question}"

Provide a brief, single-sentence hint to nudge them in the right direction without giving away the exact answer. 
Do not write any code for them. Keep it extremely concise and encouraging.`;

    let hint = "Consider breaking the problem down into smaller, testable functions and validating boundary conditions.";

    if (process.env.GROQ_API_KEY) {
      try {
        const chatCompletion = await createGroqChatCompletion({
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 150,
        });

        if (chatCompletion.choices[0]?.message?.content) {
          hint = chatCompletion.choices[0].message.content;
        }
      } catch (aiErr) {
        console.warn("Groq hint generation failed, using fallback hint:", aiErr);
      }
    }

    return NextResponse.json({ hint });
  } catch (error) {
    console.error('Hint Generation Error:', error);
    return NextResponse.json(
      { hint: "Consider identifying the core data structures and edge case boundary conditions." }
    );
  }
}

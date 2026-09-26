import { NextRequest, NextResponse } from 'next/server';
import { createGroqChatCompletion } from '@/lib/groq';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { resumeText } = await req.json();

    if (!resumeText || typeof resumeText !== 'string' || !resumeText.trim()) {
      return NextResponse.json({ error: 'Resume text is required' }, { status: 400 });
    }

    const cleanText = resumeText.slice(0, 4000);

    // Default fallback extraction via regex
    const emailMatch = cleanText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const fallbackEmail = emailMatch ? emailMatch[0] : '';

    const lines = cleanText.split('\n').map(l => l.trim()).filter(Boolean);
    const fallbackName = lines[0] ? lines[0].replace(/[^a-zA-Z\s]/g, '').trim().slice(0, 30) : 'Candidate';

    try {
      const prompt = `You are a resume parser. Extract candidate details from this resume text.
Return ONLY valid JSON with this exact schema:
{
  "name": "Candidate's full name",
  "email": "Candidate's email or empty string if not found",
  "skills": ["Skill1", "Skill2", "Skill3", "Skill4", "Skill5"],
  "summary": "1-sentence professional summary"
}

Resume Text:
"""
${cleanText}
"""`;

      const response = await createGroqChatCompletion({
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        response_format: { type: 'json_object' }
      });

      const content = response.choices?.[0]?.message?.content || '{}';
      const parsed = JSON.parse(content);

      return NextResponse.json({
        name: parsed.name && parsed.name !== 'Candidate' ? parsed.name : fallbackName,
        email: parsed.email || fallbackEmail,
        skills: Array.isArray(parsed.skills) && parsed.skills.length > 0 ? parsed.skills : ['Software Engineering', 'System Architecture', 'Problem Solving'],
        summary: parsed.summary || 'Experienced engineering professional.'
      });
    } catch (llmError) {
      console.warn('LLM extraction notice, using regex parser:', llmError);
      return NextResponse.json({
        name: fallbackName,
        email: fallbackEmail,
        skills: ['Software Engineering', 'System Architecture', 'Problem Solving'],
        summary: 'Engineering candidate'
      });
    }
  } catch (error: any) {
    console.error('Error in extract-candidate-info:', error);
    return NextResponse.json({ error: error.message || 'Failed to extract candidate info' }, { status: 500 });
  }
}

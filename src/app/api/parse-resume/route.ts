import { NextRequest, NextResponse } from 'next/server';
import PDFParser from 'pdf2json';
import { checkRateLimit } from '@/lib/ratelimit';
import { createGroqChatCompletion } from '@/lib/groq';

// Force Node.js runtime for reliable binary Buffer and pdf2json parsing
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function safeDecode(str: string): string {
  try {
    return decodeURIComponent(str);
  } catch {
    try {
      return unescape(str);
    } catch {
      return str;
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') ?? '127.0.0.1';
    const isAllowed = await checkRateLimit(ip);

    if (!isAllowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('resume') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (buffer.length === 0) {
      return NextResponse.json({ error: 'Uploaded file is empty' }, { status: 400 });
    }

    // Parse PDF using pdf2json with dual extraction (JSON AST + raw text fallback)
    const extractedText: string = await new Promise((resolve, reject) => {
      const pdfParser = new (PDFParser as any)(null, 1);

      pdfParser.on('pdfParser_dataError', (errData: any) => {
        reject(errData?.parserError || errData || new Error('PDF parsing error'));
      });

      pdfParser.on('pdfParser_dataReady', (pdfData: any) => {
        try {
          let text = '';

          // Method 1: Traverse structured Pages & Texts (most accurate & preserves clean words)
          if (pdfData && Array.isArray(pdfData.Pages)) {
            for (const page of pdfData.Pages) {
              if (Array.isArray(page.Texts)) {
                for (const textItem of page.Texts) {
                  if (Array.isArray(textItem.R)) {
                    for (const run of textItem.R) {
                      if (run.T) {
                        text += safeDecode(run.T) + ' ';
                      }
                    }
                  }
                }
                text += '\n';
              }
            }
          }

          // Method 2: Fallback to getRawTextContent() if structured traversal yielded empty
          if (!text || text.trim().length === 0) {
            const raw = pdfParser.getRawTextContent() || '';
            text = safeDecode(raw);
          }

          resolve(text);
        } catch (extractionErr) {
          // If AST traversal failed, try raw
          try {
            resolve(safeDecode(pdfParser.getRawTextContent() || ''));
          } catch {
            reject(extractionErr);
          }
        }
      });

      try {
        pdfParser.parseBuffer(buffer);
      } catch (err) {
        reject(err);
      }
    });

    // Clean and normalize whitespace & line breaks
    const cleanedText = extractedText
      .replace(/\r\n/g, ' ')
      .replace(/\n+/g, ' ')
      .replace(/\s+/g, ' ')
      .replace(/---+Page \(\d+\) Break---+/g, ' ')
      .trim();

    if (!cleanedText || cleanedText.length < 25) {
      return NextResponse.json(
        {
          error: 'Scanned or Empty PDF',
          details: 'Could not extract selectable text from this PDF. Please ensure the document is not an image scan.',
        },
        { status: 400 }
      );
    }

    // Optional AI validation: only run if GROQ_API_KEY is configured
    if (process.env.GROQ_API_KEY) {
      try {
        const chatCompletion = await createGroqChatCompletion({
          messages: [{ role: 'user', content: validationPrompt }],
          temperature: 0.0,
          max_tokens: 150,
          response_format: { type: 'json_object' },
        });

        const responseContent = chatCompletion.choices[0]?.message?.content || '{}';
        const result = JSON.parse(responseContent);

        // If the document is blatantly not a resume (e.g., restaurant menu, receipt)
        if (result.isResume === false) {
          // Check if there are common resume keywords before hard-blocking to prevent false negatives
          const resumeKeywords = ['experience', 'education', 'skills', 'projects', 'work', 'university', 'developer', 'engineer'];
          const lower = cleanedText.toLowerCase();
          const matchCount = resumeKeywords.filter(k => lower.includes(k)).length;

          // Only block if both AI flags false AND keyword heuristics fail
          if (matchCount < 2) {
            return NextResponse.json(
              {
                error: 'Invalid Document',
                details: `This does not appear to be a Resume. AI classification: ${result.reason || 'Document lacks typical resume sections.'}`,
              },
              { status: 400 }
            );
          }
        }
      } catch (aiErr) {
        console.warn('Groq validation skipped or encountered non-fatal error:', aiErr);
        // Fail open: do not block legitimate users if Groq API has latency or key issues
      }
    }

    return NextResponse.json({ text: cleanedText });
  } catch (error: any) {
    console.error('Error parsing PDF:', error);
    return NextResponse.json(
      {
        error: 'Failed to parse PDF',
        details: error.message || 'An unexpected error occurred while parsing the PDF file.',
      },
      { status: 500 }
    );
  }
}

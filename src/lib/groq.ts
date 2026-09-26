import Groq from 'groq-sdk';

export const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || 'dummy_key_to_prevent_crash' });

// High-speed, high-quota Groq Free Tier model
export const GROQ_FREE_TIER_MODEL = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';

const MODELS_PRIORITY = [
  GROQ_FREE_TIER_MODEL,
  'llama-3.1-8b-instant',
  'llama-3.3-70b-versatile',
  'gemma2-9b-it'
];

/**
 * Executes a Groq Chat Completion with automatic fallback across free tier models.
 * If one model is rate-limited, expired, or decommissioned, it seamlessly tries the next.
 */
export async function createGroqChatCompletion(
  params: Omit<Groq.Chat.CompletionCreateParamsNonStreaming, 'model'> & { model?: string }
): Promise<Groq.Chat.ChatCompletion> {
  const models = [params.model || GROQ_FREE_TIER_MODEL, ...MODELS_PRIORITY].filter(
    (m, i, arr) => arr.indexOf(m) === i
  );

  let lastError: any = null;

  for (const model of models) {
    try {
      const response = await groq.chat.completions.create({
        ...params,
        model,
      });
      return response;
    } catch (error: any) {
      console.warn(`Groq inference on ${model} failed, trying fallback model...`, error?.message || error);
      lastError = error;
    }
  }

  throw lastError || new Error('All Groq models failed');
}

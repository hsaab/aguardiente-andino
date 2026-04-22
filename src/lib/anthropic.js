import Anthropic from '@anthropic-ai/sdk';
import { SYSTEM_PROMPT, buildUserPrompt } from '../prompts/weeklyBriefing.js';
import { validateBriefing } from './briefingSchema.js';

const MODEL = 'claude-sonnet-4-6';
const MAX_TOKENS = 4096;

let clientSingleton = null;

function getClient() {
  if (clientSingleton) return clientSingleton;
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
  if (!apiKey) {
    const err = new Error('VITE_ANTHROPIC_API_KEY is not set.');
    err.code = 'MISSING_KEY';
    throw err;
  }
  clientSingleton = new Anthropic({
    apiKey,
    // Required to call Anthropic from the browser.
    dangerouslyAllowBrowser: true,
  });
  return clientSingleton;
}

/**
 * Generate a weekly briefing from parsed CSV rows. Returns a validated
 * briefing object plus token usage for cost visibility.
 */
export async function generateBriefing(rows) {
  const client = getClient();
  const userPrompt = buildUserPrompt(rows);

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userPrompt }],
  });

  const text = extractText(response);
  const briefing = validateBriefing(parseJson(text));

  const usage = response.usage ?? {};
  logUsage(usage);

  return { briefing, usage };
}

function extractText(response) {
  const block = response.content?.find((b) => b.type === 'text');
  if (!block?.text) throw new Error('Empty response from model.');
  return block.text;
}

function parseJson(text) {
  // Claude is instructed to return raw JSON, but strip markdown fences if
  // present defensively — the demo cannot afford a parse failure on stage.
  const cleaned = text
    .replace(/^\s*```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/i, '')
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch (err) {
    throw new Error(`Could not parse model response as JSON: ${err.message}`);
  }
}

function logUsage({ input_tokens = 0, output_tokens = 0 }) {
  // Pricing (USD per 1M tokens) for claude-sonnet-4-6. Keep in sync if updated.
  const INPUT_PER_M = 3.0;
  const OUTPUT_PER_M = 15.0;
  const cost = (input_tokens * INPUT_PER_M + output_tokens * OUTPUT_PER_M) / 1_000_000;
  // eslint-disable-next-line no-console
  console.info(
    `[anthropic] in=${input_tokens} out=${output_tokens} cost=$${cost.toFixed(4)}`
  );
}

import Anthropic from '@anthropic-ai/sdk';
import { SYSTEM_PROMPT, buildUserPrompt } from '../prompts/weeklyBriefing.js';
import { normalizeLanguage, validateBriefing } from './briefingSchema.js';

const MODEL = 'claude-sonnet-4-6';

// The briefing is ~6 sections (no per-account chart_data echo), so 8K output
// tokens leaves comfortable headroom without burning latency on a generous
// max we never approach.
const MAX_TOKENS = 8000;

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
 * Generate a weekly briefing from parsed CSV rows. Awaits the full response
 * before returning — the UI stays on the loading state until the briefing is
 * ready to render in one piece.
 *
 * @param {Array<object>} rows — parsed CSV rows
 * @param {object} [opts]
 * @param {'en'|'es'} [opts.lang] — target language for narrative fields
 */
export async function generateBriefing(rows, { lang = 'en' } = {}) {
  const client = getClient();
  const targetLang = normalizeLanguage(lang);
  const userPrompt = buildUserPrompt(rows, targetLang);

  // The stable system prompt is marked cache_control: ephemeral so subsequent
  // calls reuse the cached prefix (lower TTFT, ~90% cheaper input tokens).
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: [
      {
        type: 'text',
        text: SYSTEM_PROMPT,
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages: [{ role: 'user', content: userPrompt }],
  });

  // If the model hit the output cap, the JSON is almost certainly truncated.
  // Surface a clear message instead of a misleading "Unterminated string" error.
  if (response.stop_reason === 'max_tokens') {
    throw new Error(
      `Model response was truncated at max_tokens=${MAX_TOKENS}. ` +
        `Raise MAX_TOKENS in src/lib/anthropic.js or reduce input size.`
    );
  }

  const text = extractText(response);
  const parsed = parseJson(text);
  const briefing = validateBriefing(parsed);
  briefing.language = targetLang;

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
  const cleaned = stripFences(text);
  try {
    return JSON.parse(cleaned);
  } catch (err) {
    throw new Error(`Could not parse model response as JSON: ${err.message}`);
  }
}

function stripFences(text) {
  return text
    .replace(/^\s*```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/i, '')
    .trim();
}

function logUsage({
  input_tokens = 0,
  output_tokens = 0,
  cache_creation_input_tokens = 0,
  cache_read_input_tokens = 0,
}) {
  // Pricing (USD per 1M tokens) for claude-sonnet-4-6. Cached reads are
  // ~10% the price of fresh inputs; cache writes are ~125%.
  const INPUT_PER_M = 3.0;
  const OUTPUT_PER_M = 15.0;
  const CACHE_WRITE_PER_M = 3.75;
  const CACHE_READ_PER_M = 0.3;
  const cost =
    (input_tokens * INPUT_PER_M +
      output_tokens * OUTPUT_PER_M +
      cache_creation_input_tokens * CACHE_WRITE_PER_M +
      cache_read_input_tokens * CACHE_READ_PER_M) /
    1_000_000;
  // eslint-disable-next-line no-console
  console.info(
    `[anthropic] in=${input_tokens} out=${output_tokens} ` +
      `cache_w=${cache_creation_input_tokens} cache_r=${cache_read_input_tokens} ` +
      `cost=$${cost.toFixed(4)}`
  );
}

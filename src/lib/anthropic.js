import Anthropic from '@anthropic-ai/sdk';
import { parse as parsePartialJson } from 'partial-json';
import { SYSTEM_PROMPT, buildUserPrompt } from '../prompts/weeklyBriefing.js';
import { normalizeLanguage, validateBriefing } from './briefingSchema.js';

const MODEL = 'claude-sonnet-4-6';

// The briefing is now single-language across ~6 sections (no per-account
// chart_data echo), so 8K output tokens leaves comfortable headroom without
// burning latency on a generous max we never approach.
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
 * Generate a weekly briefing from parsed CSV rows. Streams the response and
 * forwards a best-effort parsed partial briefing to onPartial as tokens
 * arrive, so the UI can render section-by-section instead of staring at a
 * spinner. Returns a validated complete briefing plus token usage.
 *
 * @param {Array<object>} rows — parsed CSV rows
 * @param {object} [opts]
 * @param {'en'|'es'} [opts.lang] — target language for narrative fields
 * @param {(partial: object) => void} [opts.onPartial] — fired on each text
 *   delta with the latest best-effort parsed JSON object
 */
export async function generateBriefing(rows, { lang = 'en', onPartial } = {}) {
  const client = getClient();
  const targetLang = normalizeLanguage(lang);
  const userPrompt = buildUserPrompt(rows, targetLang);

  let accumulated = '';

  // Use messages.stream so we can fire onPartial on every text delta. The
  // stable system prompt is marked cache_control: ephemeral so subsequent
  // calls reuse the cached prefix (lower TTFT, ~90% cheaper input tokens).
  const stream = client.messages.stream({
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

  if (onPartial) {
    stream.on('text', (delta) => {
      accumulated += delta;
      const partial = tryParsePartial(accumulated);
      if (partial) {
        // Always tag the partial with the target language so the UI can
        // detect a mismatch even before the final message arrives.
        onPartial({ ...partial, language: targetLang });
      }
    });
  }

  const finalMessage = await stream.finalMessage();

  // If the model hit the output cap, the JSON is almost certainly truncated.
  // Surface a clear message instead of a misleading "Unterminated string" error.
  if (finalMessage.stop_reason === 'max_tokens') {
    throw new Error(
      `Model response was truncated at max_tokens=${MAX_TOKENS}. ` +
        `Raise MAX_TOKENS in src/lib/anthropic.js or reduce input size.`
    );
  }

  const text = onPartial ? accumulated : extractText(finalMessage);
  const parsed = parseJson(text);
  const briefing = validateBriefing(parsed);
  briefing.language = targetLang;

  const usage = finalMessage.usage ?? {};
  logUsage(usage);

  return { briefing, usage };
}

function tryParsePartial(text) {
  // partial-json tolerates unterminated strings/arrays/objects, which is
  // exactly what we need mid-stream. We strip any leading markdown fence
  // the model occasionally prepends despite instructions.
  const cleaned = stripFences(text);
  if (!cleaned.trim().startsWith('{')) return null;
  try {
    return parsePartialJson(cleaned);
  } catch {
    return null;
  }
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

import { getClient } from './anthropic.js';

const CHAT_MODEL = 'claude-sonnet-4-6';
const CHAT_MAX_TOKENS = 1024;

function logUsage({
  input_tokens = 0,
  output_tokens = 0,
  cache_creation_input_tokens = 0,
  cache_read_input_tokens = 0,
}) {
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
  console.info(
    `[anthropic] in=${input_tokens} out=${output_tokens} ` +
      `cache_w=${cache_creation_input_tokens} cache_r=${cache_read_input_tokens} ` +
      `cost=$${cost.toFixed(4)}`
  );
}

function buildChatSystemPrompt(briefing) {
  const lang = briefing?.language === 'es' ? 'es' : 'en';
  const json = JSON.stringify(briefing);

  return [
    `You answer questions about a weekly sales briefing. Ground truth is ONLY the JSON inside <briefing> below.`,
    `Reply in ${lang === 'es' ? 'Colombian Spanish' : 'English'}.`,
    `If the answer is not in that JSON, reply with one short polite sentence saying you do not have it in this briefing.`,
    `Never invent accounts, numbers, regions, competitors, or metrics not present in the JSON.`,
    `Format every reply for a glanceable chat bubble:`,
    `- Whole reply under ~120 words. No preamble ("Based on the briefing…"), no filler.`,
    `- Start with ONE short lead sentence (≤ ~20 words) that answers the question.`,
    `- When listing two or more items, use bullets. Each bullet on its own line, starts with "- ", single short line (≤ ~18 words), account + hard number up front when applicable.`,
    `- Prefer 2–5 bullets over a paragraph when listing.`,
    `- Separate the lead sentence from the bullets with one blank line.`,
    `- No markdown headings (#, ##). No bold or italics. No tables. No emojis.`,
    ``,
    `<briefing>`,
    json,
    `</briefing>`,
  ].join('\n');
}

/**
 * Ask a follow-up question grounded strictly on the briefing JSON.
 *
 * @param {object} params
 * @param {object} params.briefing — validated briefing object (includes language)
 * @param {Array<{ role: 'user' | 'assistant', content: string }>} params.history
 * @param {string} params.question
 * @returns {Promise<string>}
 */
export async function askBriefing({ briefing, history, question }) {
  const client = getClient();
  const system = buildChatSystemPrompt(briefing);

  const anthropicMessages = [
    ...history.map(({ role, content }) => ({ role, content })),
    { role: 'user', content: question },
  ];

  // The system prompt embeds the full briefing JSON, which is identical across
  // every turn in a session. Mark it cache_control: ephemeral so turn 2+ reuses
  // the cached prefix (~70% lower TTFT, input billed at ~10%).
  const response = await client.messages.create({
    model: CHAT_MODEL,
    max_tokens: CHAT_MAX_TOKENS,
    system: [
      {
        type: 'text',
        text: system,
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages: anthropicMessages,
  });

  const usage = response.usage ?? {};
  logUsage(usage);

  const block = response.content?.find((b) => b.type === 'text');
  const text = block?.text?.trim() ?? '';

  if (response.stop_reason === 'max_tokens') {
    return text || '…';
  }

  if (!text) {
    throw new Error('Empty response from model.');
  }

  return text;
}

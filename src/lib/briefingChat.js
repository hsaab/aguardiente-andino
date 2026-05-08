import { MODEL, getClient } from './anthropic.js';

const CHAT_MAX_TOKENS = 900;

export async function streamBriefingChatAnswer({ briefing, question, onText }) {
  if (!briefing) throw new Error('A completed briefing is required before chat can answer.');
  const trimmedQuestion = question?.trim();
  if (!trimmedQuestion) throw new Error('Question is required.');

  const stream = getClient().messages.stream({
    model: MODEL,
    max_tokens: CHAT_MAX_TOKENS,
    system: [
      {
        type: 'text',
        text: buildChatSystemPrompt(briefing),
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages: [
      {
        role: 'user',
        content: `Question: ${trimmedQuestion}`,
      },
    ],
  });

  stream.on('text', (_delta, textSnapshot) => {
    onText?.(textSnapshot);
  });

  const response = await stream.finalMessage();
  if (response.stop_reason === 'max_tokens') {
    throw new Error(`Chat answer was truncated at max_tokens=${CHAT_MAX_TOKENS}.`);
  }
  return extractText(response);
}

function buildChatSystemPrompt(briefing) {
  return `
You answer follow-up questions about one executive sales briefing.

Rules:
- Use only the BRIEFING_JSON below as source material.
- If the briefing does not contain the answer, say: "I don't see that in this briefing."
- Keep answers concise: one short paragraph or up to three bullets.
- Do not invent account details, raw CSV rows, or recommendations that are not in the briefing.

BRIEFING_JSON:
${JSON.stringify(briefing)}
`.trim();
}

function extractText(response) {
  const block = response.content?.find((b) => b.type === 'text');
  return block?.text ?? '';
}

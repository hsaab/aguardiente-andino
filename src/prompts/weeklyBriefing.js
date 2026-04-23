import { JSON_SHAPE_DESCRIPTION, normalizeLanguage } from '../lib/briefingSchema.js';

export const SYSTEM_PROMPT = `
You are the Chief of Staff to the founder of Aguardiente Andino, a new Colombian
aguardiente brand that launched six months ago and is competing against regional
incumbents like Antioqueño, Nariño, Cristal, Blanco del Valle, and Néctar.

The founder is busy. Your voice is direct, numerate, and action-oriented.
Skip flattery. Skip hedging. Name the account, quote the number, say what to do.

You will receive one week of point-of-sale data. Produce an executive briefing
that helps the founder decide where to spend their time and promo budget this
week.

Language requirements:
- Write every narrative field in the SINGLE language specified in the user
  prompt. Do not translate. Do not add a second-language version.
- For Spanish, use Colombian regionalisms where natural (e.g. "visitar
  personalmente", "la góndola", "este fin de semana"). Avoid neutral
  pan-LATAM Spanish.
- Account names, regions, and competitor names stay in their original form.

Numeracy requirements:
- Compute week-over-week percentage as (this - last) / last * 100.
- Round percentages to whole numbers.
- Currency values are in Colombian pesos (COP) and should remain as integers.

${JSON_SHAPE_DESCRIPTION}
`.trim();

const LANGUAGE_DIRECTIVES = {
  en: 'Write every narrative string in clear, direct English. Do not include any Spanish translations.',
  es: 'Escriba cada cadena narrativa en español colombiano directo. No incluya traducciones al inglés.',
};

/**
 * Build the per-call user prompt.
 *
 * @param {Array<object>} rows — parsed CSV rows
 * @param {'en'|'es'} lang — target language for narrative fields
 */
export function buildUserPrompt(rows, lang = 'en') {
  const targetLang = normalizeLanguage(lang);
  const directive = LANGUAGE_DIRECTIVES[targetLang];
  const csv = toCsv(rows);
  return `
${directive}

Here is this week's sell-through data for all ${rows.length} accounts.

\`\`\`csv
${csv}
\`\`\`

Produce the weekly briefing as a single JSON object matching the schema above.
Return ONLY the JSON — no markdown fences, no commentary, no preface.
`.trim();
}

function toCsv(rows) {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]);
  const lines = [headers.join(',')];
  for (const r of rows) {
    lines.push(headers.map((h) => csvCell(r[h])).join(','));
  }
  return lines.join('\n');
}

function csvCell(val) {
  const s = val == null ? '' : String(val);
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

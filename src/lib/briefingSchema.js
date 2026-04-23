// JSON contract returned by Claude. Validated at runtime so UI never renders
// a half-shaped briefing.
//
// Single-language shape: every narrative field is a flat string in the
// language the model was asked to write. Per-account chart_data is omitted —
// the client recomputes it deterministically from the input rows so the
// model never has to echo numbers it might transpose.

const EXPECTED_TOP_KEYS = [
  'week_label',
  'summary',
  'top_growers',
  'bottom_decliners',
  'competitor_threats',
  'promo_inefficiency',
  'actions',
];

const SUPPORTED_LANGUAGES = new Set(['en', 'es']);

export const JSON_SHAPE_DESCRIPTION = `
Respond with a single JSON object matching this exact shape. No prose outside the JSON.
All narrative strings must be in the single target language specified in the user prompt.

{
  "week_label": "string, e.g. 'Week 24, June 10–16, 2026'",
  "summary": "string, 2-3 sentences",
  "top_growers": [
    {
      "account": "string",
      "region": "string",
      "wow_pct": number (already in percent units, e.g. 32),
      "bottles_delta": integer (this week minus last week, positive)
    }
  ] (exactly 3 items, sorted descending by wow_pct),
  "bottom_decliners": [
    {
      "account": "string",
      "region": "string",
      "wow_pct": number (negative),
      "returns": integer,
      "reason": "string, one short sentence"
    }
  ] (exactly 3 items, sorted ascending by wow_pct),
  "competitor_threats": [
    {
      "account": "string",
      "was_position": "string, prior shelf position",
      "now_position": "string, current shelf position",
      "winning_competitor": "string",
      "note": "string, one short sentence"
    }
  ] (2 to 4 items, most critical first),
  "promo_inefficiency": [
    {
      "account": "string",
      "promo_spend_cop": integer (pesos),
      "bottles_sold": integer,
      "waste_ratio": number (cop spent per bottle, rounded),
      "note": "string, one short sentence"
    }
  ] (2 to 4 items, worst first),
  "actions": [
    {
      "priority": 1 | 2 | 3,
      "title": "string, imperative tone, under 60 chars",
      "detail": "string, one to two sentences of specific guidance"
    }
  ] (exactly 3 items)
}
`.trim();

/**
 * Validate a final, complete briefing returned by the model. Throws on
 * structural problems so the UI never renders garbage.
 *
 * The caller should attach `language` to the returned object before
 * persisting it (we do this in generateBriefing).
 */
export function validateBriefing(obj) {
  if (!obj || typeof obj !== 'object') throw new Error('Briefing is not an object.');
  for (const key of EXPECTED_TOP_KEYS) {
    if (!(key in obj)) throw new Error(`Missing key: ${key}`);
  }
  if (typeof obj.summary !== 'string' || !obj.summary.trim()) {
    throw new Error('summary must be a non-empty string.');
  }
  mustBeArray(obj.top_growers, 'top_growers', 3, 3);
  mustBeArray(obj.bottom_decliners, 'bottom_decliners', 3, 3);
  mustBeArray(obj.competitor_threats, 'competitor_threats', 1, 6);
  mustBeArray(obj.promo_inefficiency, 'promo_inefficiency', 1, 6);
  mustBeArray(obj.actions, 'actions', 3, 3);
  return obj;
}

/**
 * Normalize a language tag against the set we support. Falls back to 'en'.
 */
export function normalizeLanguage(lang) {
  return SUPPORTED_LANGUAGES.has(lang) ? lang : 'en';
}

function mustBeArray(val, name, min, max) {
  if (!Array.isArray(val)) throw new Error(`${name} must be an array.`);
  if (val.length < min || val.length > max) {
    throw new Error(`${name} must have ${min}-${max} items, got ${val.length}.`);
  }
}

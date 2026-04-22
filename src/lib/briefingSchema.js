// JSON contract returned by Claude. Validated at runtime so UI never renders
// a half-shaped briefing.

const EXPECTED_TOP_KEYS = [
  'week_label',
  'summary',
  'top_growers',
  'bottom_decliners',
  'competitor_threats',
  'promo_inefficiency',
  'actions',
  'chart_data',
];

export const JSON_SHAPE_DESCRIPTION = `
Respond with a single JSON object matching this exact shape. No prose outside the JSON.

{
  "week_label": "string, e.g. 'Week 24, June 10–16, 2026'",
  "summary": { "en": "string, 2-3 sentences", "es": "string, 2-3 sentences" },
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
      "reason_en": "string, one short sentence",
      "reason_es": "string, one short sentence"
    }
  ] (exactly 3 items, sorted ascending by wow_pct),
  "competitor_threats": [
    {
      "account": "string",
      "was_position": "string, prior shelf position",
      "now_position": "string, current shelf position",
      "winning_competitor": "string",
      "note_en": "string, one short sentence",
      "note_es": "string, one short sentence"
    }
  ] (2 to 4 items, most critical first),
  "promo_inefficiency": [
    {
      "account": "string",
      "promo_spend_cop": integer (pesos),
      "bottles_sold": integer,
      "waste_ratio": number (cop spent per bottle, rounded),
      "note_en": "string, one short sentence",
      "note_es": "string, one short sentence"
    }
  ] (2 to 4 items, worst first),
  "actions": [
    {
      "priority": 1 | 2 | 3,
      "title_en": "string, imperative tone, under 60 chars",
      "title_es": "string, imperative tone, under 60 chars",
      "detail_en": "string, one to two sentences of specific guidance",
      "detail_es": "string, one to two sentences of specific guidance"
    }
  ] (exactly 3 items),
  "chart_data": [
    { "account": "string", "wow_pct": number }
  ] (one entry per account in the input, sorted descending by wow_pct)
}
`.trim();

export function validateBriefing(obj) {
  if (!obj || typeof obj !== 'object') throw new Error('Briefing is not an object.');
  for (const key of EXPECTED_TOP_KEYS) {
    if (!(key in obj)) throw new Error(`Missing key: ${key}`);
  }
  if (!obj.summary?.en || !obj.summary?.es) {
    throw new Error('summary requires both en and es fields.');
  }
  mustBeArray(obj.top_growers, 'top_growers', 3, 3);
  mustBeArray(obj.bottom_decliners, 'bottom_decliners', 3, 3);
  mustBeArray(obj.competitor_threats, 'competitor_threats', 1, 6);
  mustBeArray(obj.promo_inefficiency, 'promo_inefficiency', 1, 6);
  mustBeArray(obj.actions, 'actions', 3, 3);
  mustBeArray(obj.chart_data, 'chart_data', 1, 1000);
  return obj;
}

function mustBeArray(val, name, min, max) {
  if (!Array.isArray(val)) throw new Error(`${name} must be an array.`);
  if (val.length < min || val.length > max) {
    throw new Error(`${name} must have ${min}-${max} items, got ${val.length}.`);
  }
}

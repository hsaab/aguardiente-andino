import Papa from 'papaparse';
import { weekOverWeek } from './format.js';

// Canonical schema — all columns must be present.
export const REQUIRED_COLUMNS = [
  'account_name',
  'account_type',
  'region',
  'bottles_sold_this_week',
  'bottles_sold_last_week',
  'returns_this_week',
  'shelf_position',
  'top_competitor_on_shelf',
  'promo_spend_cop',
];

const NUMERIC_COLUMNS = new Set([
  'bottles_sold_this_week',
  'bottles_sold_last_week',
  'returns_this_week',
  'promo_spend_cop',
]);

/**
 * Parse a CSV File or string into { rows, errors }.
 * Numeric columns are coerced to numbers. Missing required columns throw.
 */
export function parseCsv(input) {
  return new Promise((resolve, reject) => {
    const config = {
      header: true,
      skipEmptyLines: 'greedy',
      dynamicTyping: false,
      transformHeader: (h) => h.trim(),
      complete: (result) => {
        try {
          const rows = normalizeRows(result.data);
          validateSchema(rows);
          resolve({ rows, meta: result.meta });
        } catch (err) {
          reject(err);
        }
      },
      error: (err) => reject(err),
    };

    if (typeof input === 'string') {
      Papa.parse(input, config);
    } else {
      Papa.parse(input, config);
    }
  });
}

function normalizeRows(raw) {
  return raw.map((row) => {
    const out = {};
    for (const key of Object.keys(row)) {
      const trimmed = typeof row[key] === 'string' ? row[key].trim() : row[key];
      if (NUMERIC_COLUMNS.has(key)) {
        const n = Number(trimmed);
        out[key] = Number.isFinite(n) ? n : 0;
      } else {
        out[key] = trimmed;
      }
    }
    return out;
  });
}

function validateSchema(rows) {
  if (!rows.length) {
    throw new Error('CSV is empty.');
  }
  const headers = Object.keys(rows[0]);
  const missing = REQUIRED_COLUMNS.filter((c) => !headers.includes(c));
  if (missing.length) {
    throw new Error(`Missing required columns: ${missing.join(', ')}`);
  }
}

/**
 * Derive convenient summary stats from parsed rows.
 */
export function summarize(rows) {
  const regions = new Set(rows.map((r) => r.region));
  const accountTypes = new Set(rows.map((r) => r.account_type));
  const totalBottles = rows.reduce((s, r) => s + (r.bottles_sold_this_week || 0), 0);
  const totalBottlesPrev = rows.reduce((s, r) => s + (r.bottles_sold_last_week || 0), 0);
  const totalPromo = rows.reduce((s, r) => s + (r.promo_spend_cop || 0), 0);
  const totalWow = weekOverWeek(totalBottles, totalBottlesPrev);
  return {
    accounts: rows.length,
    regions: regions.size,
    regionList: [...regions],
    accountTypes: [...accountTypes],
    totalBottles,
    totalBottlesPrev,
    totalWowPct: totalWow,
    totalPromo,
  };
}

/**
 * Fetch the bundled sample CSV and return parsed rows.
 */
export async function loadSampleCsv() {
  const res = await fetch('/sample-data.csv');
  if (!res.ok) throw new Error('Could not load sample data.');
  const text = await res.text();
  return parseCsv(text);
}

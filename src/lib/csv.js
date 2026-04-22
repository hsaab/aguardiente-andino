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

// Bundled sample files, one per region/rep. Ships 10 files to showcase the
// "drop all 10 rep CSVs at once" demo moment.
export const SAMPLE_FILE_MANIFEST = [
  'ventas-bogota-semana24.csv',
  'ventas-medellin-semana24.csv',
  'ventas-cali-semana24.csv',
  'ventas-barranquilla-semana24.csv',
  'ventas-cartagena-semana24.csv',
  'ventas-bucaramanga-semana24.csv',
  'ventas-pereira-semana24.csv',
  'ventas-santa-marta-semana24.csv',
  'ventas-cucuta-semana24.csv',
  'ventas-villavicencio-semana24.csv',
];

/**
 * Parse a single CSV File or string into { rows, errors }.
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

    Papa.parse(input, config);
  });
}

/**
 * Parse many CSV inputs in parallel. Each input is a `{ name, source }` tuple
 * where `source` is a File, Blob, or raw string. Failures are isolated
 * per-file so a single bad file never blocks the rest.
 *
 * Returns { rows, files } where:
 *   - rows: merged, deduped rows across all successful files
 *   - files: per-file metadata [{ name, rowCount, error?, duplicates? }]
 */
export async function parseCsvFiles(inputs) {
  const settled = await Promise.all(
    inputs.map(async ({ name, source }) => {
      try {
        const { rows } = await parseCsv(source);
        return { name, rows, rowCount: rows.length };
      } catch (err) {
        return { name, rows: [], rowCount: 0, error: err.message || String(err) };
      }
    })
  );

  // Merge + dedupe across files. Same (account_name, region) collapses to the
  // last occurrence; we count duplicates per-file for UI surfacing.
  const seen = new Map(); // key -> { row, sourceFile }
  const duplicatesByFile = new Map();

  for (const entry of settled) {
    if (entry.error) continue;
    for (const row of entry.rows) {
      const key = `${row.account_name}::${row.region}`;
      if (seen.has(key)) {
        const prev = seen.get(key);
        duplicatesByFile.set(
          entry.name,
          (duplicatesByFile.get(entry.name) ?? 0) + 1
        );
        // Last writer wins; replace previous.
        seen.set(key, { row, sourceFile: entry.name });
        // Drop the displaced row from the earlier file's count.
        if (prev.sourceFile !== entry.name) {
          const f = settled.find((s) => s.name === prev.sourceFile);
          if (f) f.rowCount = Math.max(0, f.rowCount - 1);
        }
      } else {
        seen.set(key, { row, sourceFile: entry.name });
      }
    }
  }

  const rows = [...seen.values()].map((v) => v.row);
  const files = settled.map((e) => ({
    name: e.name,
    rowCount: e.rowCount,
    error: e.error,
    duplicates: duplicatesByFile.get(e.name),
  }));

  return { rows, files };
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
 * Fetch all bundled regional sample CSVs in parallel and return parsed rows
 * plus per-file metadata. Used by the "Use sample data" link.
 */
export async function loadSampleCsvFiles() {
  const fetches = await Promise.all(
    SAMPLE_FILE_MANIFEST.map(async (name) => {
      const res = await fetch(`/sample-data/${name}`);
      if (!res.ok) throw new Error(`Could not load ${name}.`);
      return { name, source: await res.text() };
    })
  );
  return parseCsvFiles(fetches);
}

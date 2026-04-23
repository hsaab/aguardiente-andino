// Formatting helpers for currencies, percentages, and WoW growth.

// Pinned exchange rate for demo stability. Update this value the morning of
// the keynote if the peso has moved meaningfully.
export const COP_PER_USD = 4000;

const copFormatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

const usdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

/**
 * Format a COP amount in the active currency.
 * @param {number} cop — amount in Colombian pesos
 * @param {'COP'|'USD'} currency
 */
export function formatMoney(cop, currency = 'COP') {
  if (cop == null || Number.isNaN(cop)) return '—';
  if (currency === 'USD') {
    return usdFormatter.format(Math.round(cop / COP_PER_USD));
  }
  return copFormatter.format(cop);
}

const copCompactFormatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  notation: 'compact',
  maximumFractionDigits: 1,
});

const usdCompactFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  notation: 'compact',
  maximumFractionDigits: 1,
});

/**
 * Compact-notation money formatter for hero cards where horizontal space is
 * tight. e.g. 20410000 COP -> "$20,4 M". Always strips the NBSP that
 * Intl.NumberFormat inserts between the currency glyph and the digits so the
 * value reads as a single tight token.
 *
 * Use this only on tight surfaces (hero stat cards). Tables, the promo-waste
 * list, and the PDF still want the full-digit formatMoney for clarity.
 *
 * @param {number} cop — amount in Colombian pesos
 * @param {'COP'|'USD'} currency
 */
export function formatMoneyCompact(cop, currency = 'COP') {
  if (cop == null || Number.isNaN(cop)) return '—';
  const fmt = currency === 'USD' ? usdCompactFormatter : copCompactFormatter;
  const value = currency === 'USD' ? cop / COP_PER_USD : cop;
  return fmt.format(value).replace(/\u00A0/g, ' ');
}

const intFormatter = new Intl.NumberFormat('es-CO');

export function formatInt(n) {
  if (n == null || Number.isNaN(n)) return '—';
  return intFormatter.format(n);
}

/**
 * Format a signed percentage like +32% or -41%.
 * @param {number} pct — already in percent units (e.g. 32, not 0.32)
 */
export function formatPct(pct, { withSign = true, digits = 0 } = {}) {
  if (pct == null || Number.isNaN(pct)) return '—';
  const rounded = pct.toFixed(digits);
  const sign = withSign && pct > 0 ? '+' : '';
  return `${sign}${rounded}%`;
}

/**
 * Week-over-week growth percentage.
 * Handles zero baseline by returning null (cannot compute percent from 0).
 */
export function weekOverWeek(thisWeek, lastWeek) {
  if (!lastWeek || lastWeek === 0) return null;
  return ((thisWeek - lastWeek) / lastWeek) * 100;
}

export function formatDate(date, lang = 'en') {
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleDateString(lang === 'es' ? 'es-CO' : 'en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

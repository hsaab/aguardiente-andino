// Deterministic, client-side derivations from raw CSV rows. The model
// never echoes these numbers — we compute them here so the hero stats and
// growth chart cannot drift from ground truth (or get hallucinated).

/**
 * Compute the four hero-card metrics shown above the briefing.
 *
 * @param {Array<object>} rows — parsed CSV rows
 */
export function buildHeroStats(rows) {
  const safeRows = Array.isArray(rows) ? rows : [];
  const totalBottles = safeRows.reduce(
    (sum, r) => sum + (r.bottles_sold_this_week || 0),
    0
  );
  const totalPrev = safeRows.reduce(
    (sum, r) => sum + (r.bottles_sold_last_week || 0),
    0
  );
  const totalWowPct = totalPrev
    ? ((totalBottles - totalPrev) / totalPrev) * 100
    : 0;
  const totalPromo = safeRows.reduce(
    (sum, r) => sum + (r.promo_spend_cop || 0),
    0
  );

  let growingCount = 0;
  let decliningCount = 0;
  for (const r of safeRows) {
    if (!r.bottles_sold_last_week) continue;
    const wow = r.bottles_sold_this_week - r.bottles_sold_last_week;
    if (wow > 0) growingCount++;
    else if (wow < 0) decliningCount++;
  }

  return {
    totalBottles,
    totalWowPct,
    totalPromoDisplay: totalPromo,
    growingCount,
    decliningCount,
    bottles: '',
  };
}

/**
 * Build the per-account growth-chart series client-side. One entry per
 * input account, sorted descending by week-over-week percent.
 *
 * @param {Array<object>} rows — parsed CSV rows
 */
export function buildChartData(rows) {
  const safeRows = Array.isArray(rows) ? rows : [];
  return safeRows
    .map((r) => {
      const last = r.bottles_sold_last_week || 0;
      const wow = last
        ? ((r.bottles_sold_this_week - last) / last) * 100
        : 0;
      return { account: r.account_name, wow_pct: Math.round(wow) };
    })
    .sort((a, b) => b.wow_pct - a.wow_pct);
}

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import SectionCard from './SectionCard.jsx';
import HeroMetric from './HeroMetric.jsx';
import GrowthChart from './GrowthChart.jsx';
import { useStrings } from '../i18n/strings.js';
import { formatInt, formatMoney, formatPct } from '../lib/format.js';

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.09, delayChildren: 0.1 },
  },
};

/**
 * Renders the six-section executive briefing plus the growth chart.
 * Language toggle is instant — all narrative fields carry en + es.
 */
export default function BriefingView({ briefing, lang, currency, rows, isCached }) {
  const t = useStrings(lang);

  const topSummaryStats = useMemo(() => buildHeroStats(briefing, rows), [briefing, rows]);

  return (
    <motion.section
      className="mx-auto max-w-content"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <Hero
        briefing={briefing}
        lang={lang}
        currency={currency}
        stats={topSummaryStats}
        isCached={isCached}
      />

      <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-5">
        <SectionCard eyebrow={t.topGrowers} accent="emerald">
          <ol className="space-y-4">
            {briefing.top_growers.map((g, i) => (
              <RankedRow
                key={g.account}
                rank={i + 1}
                title={g.account}
                subtitle={g.region}
                metric={formatPct(g.wow_pct)}
                metricTone="positive"
                trailing={`+${formatInt(g.bottles_delta)} ${t.bottles}`}
              />
            ))}
          </ol>
        </SectionCard>

        <SectionCard eyebrow={t.bottomDecliners} accent="danger">
          <ol className="space-y-4">
            {briefing.bottom_decliners.map((d, i) => (
              <RankedRow
                key={d.account}
                rank={i + 1}
                title={d.account}
                subtitle={d.region}
                metric={formatPct(d.wow_pct)}
                metricTone="negative"
                trailing={`${d.returns} ${t.returns.toLowerCase()}`}
                note={lang === 'es' ? d.reason_es : d.reason_en}
              />
            ))}
          </ol>
        </SectionCard>

        <SectionCard eyebrow={t.competitorThreats} accent="gold">
          <ul className="space-y-4">
            {briefing.competitor_threats.map((th) => (
              <li key={th.account} className="border-b border-charcoal/5 pb-4 last:border-0 last:pb-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="font-semibold text-charcoal">{th.account}</div>
                  <div className="text-xs font-medium uppercase tracking-wide text-gold-700 shrink-0">
                    {th.winning_competitor}
                  </div>
                </div>
                <div className="mt-1 text-sm text-muted">
                  {t.wasNow(th.was_position, th.now_position)}
                </div>
                <p className="mt-2 text-base text-charcoal/80 leading-relaxed">
                  {lang === 'es' ? th.note_es : th.note_en}
                </p>
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard eyebrow={t.promoInefficiency} accent="danger">
          <ul className="space-y-4">
            {briefing.promo_inefficiency.map((p) => (
              <li key={p.account} className="border-b border-charcoal/5 pb-4 last:border-0 last:pb-0">
                <div className="flex items-baseline justify-between gap-3">
                  <div className="font-semibold text-charcoal">{p.account}</div>
                  <div className="text-sm font-medium text-danger tabular-nums shrink-0">
                    {formatMoney(p.promo_spend_cop, currency)}
                  </div>
                </div>
                <div className="mt-1 text-sm text-muted">
                  {formatInt(p.bottles_sold)} {t.bottles} · {formatMoney(p.waste_ratio, currency)}/{lang === 'es' ? 'botella' : 'bottle'}
                </div>
                <p className="mt-2 text-base text-charcoal/80 leading-relaxed">
                  {lang === 'es' ? p.note_es : p.note_en}
                </p>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>

      <div className="mt-5">
        <SectionCard eyebrow={t.actions} accent="emerald">
          <ol className="space-y-5">
            {briefing.actions.map((a) => (
              <li key={a.priority} className="flex gap-5 items-start">
                <div className="shrink-0 h-10 w-10 rounded-full bg-emerald-800 text-white font-display text-lg font-semibold flex items-center justify-center tabular-nums">
                  {a.priority}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-display text-xl md:text-2xl font-semibold text-charcoal">
                    {lang === 'es' ? a.title_es : a.title_en}
                  </div>
                  <p className="mt-1.5 text-base text-charcoal/80 leading-relaxed">
                    {lang === 'es' ? a.detail_es : a.detail_en}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </SectionCard>
      </div>

      <div className="mt-10">
        <GrowthChart data={briefing.chart_data} lang={lang} />
      </div>
    </motion.section>
  );
}

function Hero({ briefing, lang, currency, stats, isCached }) {
  const t = useStrings(lang);
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 14 },
        visible: { opacity: 1, y: 0 },
      }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="relative"
    >
      {isCached && (
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-gold-700 mb-4">
          <span className="h-1.5 w-1.5 rounded-full bg-gold-600" />
          {t.cachedBadge}
        </div>
      )}
      <div className="eyebrow">{briefing.week_label}</div>
      <h2 className="mt-3 font-display text-4xl md:text-5xl font-semibold text-charcoal tracking-tight">
        {t.summary}
      </h2>
      <p className="mt-5 font-display text-xl md:text-2xl leading-snug text-charcoal/90 max-w-4xl">
        {lang === 'es' ? briefing.summary.es : briefing.summary.en}
      </p>

      <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
        <HeroStat
          label={lang === 'es' ? 'Total vendido' : 'Total sold'}
          value={
            <HeroMetric
              value={stats.totalBottles}
              formatValue={(v) => formatInt(Math.round(v))}
              className="text-4xl md:text-5xl font-semibold text-charcoal"
            />
          }
          sub={`${stats.bottles} ${t.bottles}`}
        />
        <HeroStat
          label={lang === 'es' ? 'Crecimiento' : 'WoW growth'}
          value={
            <HeroMetric
              value={stats.totalWowPct}
              formatValue={(v) => `${v.toFixed(0)}%`}
              signed
              className={`text-4xl md:text-5xl font-semibold ${stats.totalWowPct >= 0 ? 'text-emerald-700' : 'text-danger'}`}
            />
          }
          sub={lang === 'es' ? 'vs. semana pasada' : 'vs. last week'}
        />
        <HeroStat
          label={lang === 'es' ? 'Cuentas en crecimiento' : 'Accounts growing'}
          value={
            <HeroMetric
              value={stats.growingCount}
              className="text-4xl md:text-5xl font-semibold text-emerald-700"
            />
          }
          sub={`${stats.decliningCount} ${lang === 'es' ? 'en caída' : 'declining'}`}
        />
        <HeroStat
          label={t.spent}
          value={
            <HeroMetric
              value={stats.totalPromoDisplay}
              formatValue={(v) => formatMoney(Math.round(v), currency)}
              className="text-3xl md:text-4xl font-semibold text-charcoal"
            />
          }
          sub={lang === 'es' ? 'en promoción' : 'in promo budget'}
        />
      </div>
    </motion.div>
  );
}

function HeroStat({ label, value, sub }) {
  return (
    <div className="card p-5">
      <div className="eyebrow">{label}</div>
      <div className="mt-3 metric">{value}</div>
      {sub && <div className="mt-1 text-sm text-muted">{sub}</div>}
    </div>
  );
}

function RankedRow({ rank, title, subtitle, metric, metricTone, trailing, note }) {
  const tone = metricTone === 'positive' ? 'text-emerald-700' : 'text-danger';
  return (
    <li className="flex gap-4 items-start">
      <div className="shrink-0 mt-0.5 h-7 w-7 rounded-full bg-charcoal/5 text-charcoal font-semibold text-sm flex items-center justify-center tabular-nums">
        {rank}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-3">
          <div className="font-semibold text-charcoal truncate">{title}</div>
          <div className={`font-semibold tabular-nums shrink-0 ${tone}`}>{metric}</div>
        </div>
        <div className="text-sm text-muted flex justify-between gap-3">
          <span>{subtitle}</span>
          <span>{trailing}</span>
        </div>
        {note && <p className="mt-1.5 text-sm text-charcoal/75">{note}</p>}
      </div>
    </li>
  );
}

function buildHeroStats(briefing, rows) {
  // Compute from raw rows so the hero always matches ground truth even if
  // the model misremembers a figure.
  const safeRows = rows ?? [];
  const totalBottles = safeRows.reduce((s, r) => s + (r.bottles_sold_this_week || 0), 0);
  const totalPrev = safeRows.reduce((s, r) => s + (r.bottles_sold_last_week || 0), 0);
  const totalWowPct = totalPrev ? ((totalBottles - totalPrev) / totalPrev) * 100 : 0;
  const totalPromo = safeRows.reduce((s, r) => s + (r.promo_spend_cop || 0), 0);
  const growingCount = briefing.chart_data.filter((c) => c.wow_pct > 0).length;
  const decliningCount = briefing.chart_data.filter((c) => c.wow_pct < 0).length;
  return {
    totalBottles,
    totalWowPct,
    totalPromoDisplay: totalPromo,
    growingCount,
    decliningCount,
    bottles: '',
  };
}

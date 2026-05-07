import { useMemo } from 'react';
import { motion } from 'framer-motion';

import SectionCard from './SectionCard.jsx';
import HeroMetric from './HeroMetric.jsx';
import GrowthChart from './GrowthChart.jsx';
import { useStrings } from '../i18n/strings.js';
import { formatInt, formatMoney, formatMoneyCompact, formatPct } from '../lib/format.js';
import { buildChartData, buildHeroStats } from '../lib/briefingMetrics.js';

const MotionSection = motion.section;
const MotionDiv = motion.div;

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.09, delayChildren: 0.1 },
  },
};

/**
 * Renders the six-section executive briefing plus the growth chart.
 *
 * The briefing carries one language only (briefing.language). When the user
 * toggles the UI language to a different one, an inline "Re-generate" CTA
 * appears so they can request a fresh briefing in that language.
 *
 * Assumes a complete briefing object — the upstream stage machine waits for
 * the full response before mounting this view.
 */
export default function BriefingView({
  briefing,
  lang,
  currency,
  rows,
  isCached,
  onRegenerateLanguage,
}) {
  const t = useStrings(lang);

  const heroStats = useMemo(() => buildHeroStats(rows), [rows]);
  const chartData = useMemo(() => buildChartData(rows), [rows]);

  const briefingLang = briefing?.language;
  const langMismatch = briefingLang && briefingLang !== lang;

  return (
    <MotionSection
      className="mx-auto max-w-content"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <Hero
        briefing={briefing}
        lang={lang}
        currency={currency}
        stats={heroStats}
        isCached={isCached}
      />

      {langMismatch && onRegenerateLanguage && (
        <RegenerateLanguageBanner
          lang={lang}
          briefingLang={briefingLang}
          onRegenerate={onRegenerateLanguage}
          t={t}
        />
      )}

      <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-5">
        <SectionCard eyebrow={t.topGrowers} accent="emerald">
          <ol className="space-y-4">
            {briefing.top_growers.map((g, i) => (
              <RankedRow
                key={`${g.account}-${i}`}
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
                key={`${d.account}-${i}`}
                rank={i + 1}
                title={d.account}
                subtitle={d.region}
                metric={formatPct(d.wow_pct)}
                metricTone="negative"
                trailing={`${d.returns} ${t.returns.toLowerCase()}`}
                note={d.reason}
              />
            ))}
          </ol>
        </SectionCard>

        <SectionCard eyebrow={t.competitorThreats} accent="gold">
          <ul className="space-y-4">
            {briefing.competitor_threats.map((th, i) => (
              <li key={`${th.account}-${i}`} className="border-b border-charcoal/5 pb-4 last:border-0 last:pb-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="font-semibold text-charcoal">{th.account}</div>
                  <div className="text-xs font-medium uppercase tracking-wide text-gold-700 shrink-0">
                    {th.winning_competitor}
                  </div>
                </div>
                <div className="mt-1 text-sm text-muted">
                  {t.wasNow(th.was_position, th.now_position)}
                </div>
                {th.note && (
                  <p className="mt-2 text-base text-charcoal/80 leading-relaxed">{th.note}</p>
                )}
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard eyebrow={t.promoInefficiency} accent="danger">
          <ul className="space-y-4">
            {briefing.promo_inefficiency.map((p, i) => (
              <li key={`${p.account}-${i}`} className="border-b border-charcoal/5 pb-4 last:border-0 last:pb-0">
                <div className="flex items-baseline justify-between gap-3">
                  <div className="font-semibold text-charcoal">{p.account}</div>
                  <div className="text-sm font-medium text-danger tabular-nums shrink-0">
                    {formatMoney(p.promo_spend_cop, currency)}
                  </div>
                </div>
                <div className="mt-1 text-sm text-muted">
                  {formatInt(p.bottles_sold)} {t.bottles} · {formatMoney(p.waste_ratio, currency)}/
                  {lang === 'es' ? 'botella' : 'bottle'}
                </div>
                {p.note && (
                  <p className="mt-2 text-base text-charcoal/80 leading-relaxed">{p.note}</p>
                )}
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>

      <div className="mt-5">
        <SectionCard eyebrow={t.actions} accent="emerald">
          <ol className="space-y-5">
            {briefing.actions.map((a, i) => (
              <li key={a.priority ?? i} className="flex gap-5 items-start">
                <div className="shrink-0 h-10 w-10 rounded-full bg-emerald-800 text-white font-display text-lg font-semibold flex items-center justify-center tabular-nums">
                  {a.priority ?? i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  {a.title && (
                    <div className="font-display text-xl md:text-2xl font-semibold text-charcoal">
                      {a.title}
                    </div>
                  )}
                  {a.detail && (
                    <p className="mt-1.5 text-base text-charcoal/80 leading-relaxed">{a.detail}</p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </SectionCard>
      </div>

      <div className="mt-10">
        <GrowthChart data={chartData} lang={lang} />
      </div>
    </MotionSection>
  );
}

function Hero({ briefing, lang, currency, stats, isCached }) {
  const t = useStrings(lang);

  return (
    <MotionDiv
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
      <div className="eyebrow min-h-[1rem]">{briefing.week_label}</div>
      <h2 className="mt-3 font-display text-4xl md:text-5xl font-semibold text-charcoal tracking-tight">
        {t.summary}
      </h2>
      <p className="mt-5 font-display text-xl md:text-2xl leading-snug text-charcoal/90 max-w-4xl">
        {briefing.summary}
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
              formatValue={(v) => formatMoneyCompact(Math.round(v), currency)}
              className="text-3xl md:text-4xl font-semibold text-charcoal"
            />
          }
          sub={lang === 'es' ? 'en promoción' : 'in promo budget'}
        />
      </div>
    </MotionDiv>
  );
}

function RegenerateLanguageBanner({ lang, briefingLang, onRegenerate, t }) {
  // The banner is shown to the user in the UI's active language, but the
  // CTA targets the language they just switched to.
  const targetLanguageLabel = lang === 'es' ? t.languageEs : t.languageEn;
  const note =
    lang === 'es'
      ? `Este briefing está en ${briefingLang === 'en' ? 'inglés' : 'español'}.`
      : `This briefing is in ${briefingLang === 'en' ? 'English' : 'Spanish'}.`;
  return (
    <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-gold-600/30 bg-gold-50/60 px-5 py-3">
      <span className="text-sm text-charcoal/80">{note}</span>
      <button
        type="button"
        onClick={() => onRegenerate(lang)}
        className="text-sm font-semibold text-emerald-900 hover:underline"
      >
        {t.regenerateInLang(targetLanguageLabel)} →
      </button>
    </div>
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

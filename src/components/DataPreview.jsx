import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { summarize } from '../lib/csv.js';
import { formatInt, formatMoney, formatPct, weekOverWeek } from '../lib/format.js';
import { useStrings } from '../i18n/strings.js';

/**
 * Preview the first 5 rows of parsed data, show top-line stats, and
 * host the primary "Generate briefing" CTA.
 */
export default function DataPreview({ rows, lang, currency, onGenerate, onReset }) {
  const t = useStrings(lang);
  const stats = useMemo(() => summarize(rows), [rows]);
  const sample = rows.slice(0, 5);

  return (
    <motion.section
      layoutId="stage-card"
      className="mx-auto max-w-5xl"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="flex items-end justify-between gap-6 flex-wrap">
        <div>
          <span className="eyebrow">{t.previewTitle}</span>
          <h2 className="mt-3 font-display text-4xl font-semibold text-charcoal">
            {t.previewSubtitle(stats.accounts, stats.regions)}
          </h2>
        </div>
        <button onClick={onReset} className="btn-ghost">
          {t.previewReupload}
        </button>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          label={t.sold}
          value={`${formatInt(stats.totalBottles)} ${t.bottles}`}
          sub={formatPct(stats.totalWowPct ?? 0)}
          positive={(stats.totalWowPct ?? 0) >= 0}
        />
        <StatCard
          label={t.spent}
          value={formatMoney(stats.totalPromo, currency)}
          sub={`${stats.accounts} ${lang === 'es' ? 'cuentas' : 'accounts'}`}
        />
        <StatCard
          label={lang === 'es' ? 'Regiones' : 'Regions'}
          value={stats.regionList.slice(0, 3).join(', ') + (stats.regionList.length > 3 ? '…' : '')}
          sub={`${stats.accountTypes.length} ${lang === 'es' ? 'tipos de cuenta' : 'account types'}`}
        />
      </div>

      <div className="mt-8 card card-hover overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-cream border-b border-charcoal/10">
              <tr className="text-left">
                <Th>Account</Th>
                <Th>Region</Th>
                <Th className="text-right">This Wk</Th>
                <Th className="text-right">Last Wk</Th>
                <Th className="text-right">WoW</Th>
                <Th>Shelf</Th>
                <Th>Top Competitor</Th>
                <Th className="text-right">Promo</Th>
              </tr>
            </thead>
            <tbody>
              {sample.map((row, i) => {
                const wow = weekOverWeek(row.bottles_sold_this_week, row.bottles_sold_last_week);
                return (
                  <tr key={i} className="border-b border-charcoal/5 last:border-0">
                    <Td className="font-medium">{row.account_name}</Td>
                    <Td>{row.region}</Td>
                    <Td className="text-right tabular-nums">{formatInt(row.bottles_sold_this_week)}</Td>
                    <Td className="text-right tabular-nums text-muted">{formatInt(row.bottles_sold_last_week)}</Td>
                    <Td className={`text-right tabular-nums font-semibold ${wow >= 0 ? 'text-emerald-700' : 'text-danger'}`}>
                      {formatPct(wow ?? 0)}
                    </Td>
                    <Td>{row.shelf_position}</Td>
                    <Td>{row.top_competitor_on_shelf}</Td>
                    <Td className="text-right tabular-nums">{formatMoney(row.promo_spend_cop, currency)}</Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-3 text-xs text-muted border-t border-charcoal/10">
          {lang === 'es'
            ? `Mostrando 5 de ${stats.accounts} filas`
            : `Showing 5 of ${stats.accounts} rows`}
        </div>
      </div>

      <div className="mt-10 flex justify-center">
        <button onClick={onGenerate} className="btn-gold">
          <SparkleIcon />
          {t.generate}
        </button>
      </div>
    </motion.section>
  );
}

function Th({ children, className = '' }) {
  return (
    <th className={`px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted ${className}`}>
      {children}
    </th>
  );
}

function Td({ children, className = '' }) {
  return <td className={`px-5 py-3.5 ${className}`}>{children}</td>;
}

function StatCard({ label, value, sub, positive }) {
  return (
    <div className="card card-hover p-5">
      <div className="eyebrow">{label}</div>
      <div className="mt-2 font-display text-2xl font-semibold text-charcoal">
        {value}
      </div>
      {sub && (
        <div className={`mt-1 text-sm ${positive === undefined ? 'text-muted' : positive ? 'text-emerald-700 font-medium' : 'text-danger font-medium'}`}>
          {sub}
        </div>
      )}
    </div>
  );
}

function SparkleIcon() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.091 3.091ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
    </svg>
  );
}

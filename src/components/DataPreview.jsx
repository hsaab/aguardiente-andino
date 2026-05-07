import { motion } from 'framer-motion';

import { useMemo, useState } from 'react';
import { summarize } from '../lib/csv.js';
import { formatInt, formatMoney, formatMoneyCompact, formatPct, weekOverWeek } from '../lib/format.js';
import { useStrings } from '../i18n/strings.js';

const MotionSection = motion.section;

/**
 * Preview the first 5 rows of parsed data, show top-line stats, and
 * host the primary "Generate briefing" CTA.
 *
 * The user picks the briefing language explicitly here so the model only
 * generates one language (~halving output tokens / latency).
 */
export default function DataPreview({ rows, files, lang, currency, onGenerate, onReset }) {
  const t = useStrings(lang);
  const stats = useMemo(() => summarize(rows), [rows]);
  const sample = rows.slice(0, 5);
  const fileCount = files?.length ?? 0;
  // Default the report language to whatever UI language is active. The user
  // can override before clicking Generate.
  const [reportLang, setReportLang] = useState(lang);
  // Only surface chip row when multi-file (adds no signal for single-file case).
  const showFileChips = fileCount > 1;

  return (
    <MotionSection
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
            {t.previewSubtitle(stats.accounts, stats.regions, fileCount)}
          </h2>
        </div>
        <button onClick={onReset} className="btn-ghost">
          {t.previewReupload}
        </button>
      </div>

      {showFileChips && (
        <div className="mt-6">
          <div className="eyebrow mb-3">{t.filesLoaded(fileCount)}</div>
          <div className="flex flex-wrap gap-2">
            {files.map((f) => (
              <FileChip key={f.name} file={f} lang={lang} t={t} />
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          label={t.sold}
          value={`${formatInt(stats.totalBottles)} ${t.bottles}`}
          sub={formatPct(stats.totalWowPct ?? 0)}
          positive={(stats.totalWowPct ?? 0) >= 0}
        />
        <StatCard
          label={t.spent}
          value={formatMoneyCompact(stats.totalPromo, currency)}
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

      <div className="mt-10 flex flex-col items-center gap-4">
        <ReportLanguagePicker
          label={t.reportLanguage}
          value={reportLang}
          onChange={setReportLang}
        />
        <button onClick={() => onGenerate(reportLang)} className="btn-gold">
          <SparkleIcon />
          {t.generate}
        </button>
      </div>
    </MotionSection>
  );
}

function ReportLanguagePicker({ label, value, onChange }) {
  const options = [
    { value: 'en', label: 'EN' },
    { value: 'es', label: 'ES' },
  ];
  return (
    <div className="flex items-center gap-3">
      <span className="eyebrow text-muted">{label}</span>
      <div
        role="group"
        aria-label={label}
        className="inline-flex rounded-lg border border-charcoal/10 bg-surface p-1 shadow-card"
      >
        {options.map((opt) => {
          const active = opt.value === value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={[
                'rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-200',
                active
                  ? 'bg-emerald-800 text-white shadow-sm'
                  : 'text-muted hover:text-charcoal',
              ].join(' ')}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function FileChip({ file, t }) {
  const hasError = Boolean(file.error);
  const classes = hasError
    ? 'border-danger/30 bg-danger/5 text-danger'
    : 'border-emerald-800/20 bg-emerald-50 text-emerald-900';
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${classes}`}
      title={hasError ? t.fileError(file.error) : undefined}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${hasError ? 'bg-danger' : 'bg-emerald-700'}`}
        aria-hidden
      />
      <span className="font-mono text-[11px]">{file.name}</span>
      <span className="text-charcoal/60">
        {hasError ? t.fileError(file.error) : t.fileRowCount(file.rowCount)}
      </span>
    </span>
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

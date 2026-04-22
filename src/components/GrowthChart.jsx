import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';
import { useStrings } from '../i18n/strings.js';

/**
 * Horizontal bar chart of week-over-week growth per account.
 * Emerald bars for positive, red for negative. Bars sweep in left-to-right.
 */
export default function GrowthChart({ data, lang }) {
  const t = useStrings(lang);

  const sorted = useMemo(
    () => [...data].sort((a, b) => b.wow_pct - a.wow_pct),
    [data]
  );

  const rowHeight = 28;
  const chartHeight = Math.max(320, sorted.length * rowHeight + 40);

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="card p-7"
    >
      <div className="eyebrow">{t.chartTitle}</div>
      <h3 className="mt-2 font-display text-2xl md:text-3xl font-semibold text-charcoal">
        {lang === 'es'
          ? `${sorted.length} cuentas ordenadas por crecimiento`
          : `${sorted.length} accounts ranked by growth`}
      </h3>

      <div className="mt-6" style={{ height: chartHeight }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={sorted}
            layout="vertical"
            margin={{ top: 10, right: 70, bottom: 10, left: 12 }}
            barCategoryGap={4}
          >
            <defs>
              <linearGradient id="emerald-bar" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0%" stopColor="#047857" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
              <linearGradient id="danger-bar" x1="1" x2="0" y1="0" y2="0">
                <stop offset="0%" stopColor="#dc2626" />
                <stop offset="100%" stopColor="#b91c1c" />
              </linearGradient>
            </defs>

            <XAxis
              type="number"
              tickFormatter={(v) => `${Math.round(v)}%`}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#71717a' }}
              domain={[
                (dataMin) => Math.floor(Math.min(dataMin, -5) * 1.25),
                (dataMax) => Math.ceil(Math.max(dataMax, 5) * 1.25),
              ]}
              allowDecimals={false}
            />
            <YAxis
              type="category"
              dataKey="account"
              axisLine={false}
              tickLine={false}
              width={220}
              tick={{ fontSize: 13, fill: '#18181b' }}
              interval={0}
            />
            <ReferenceLine x={0} stroke="#18181b" strokeOpacity={0.25} />
            <Bar
              dataKey="wow_pct"
              radius={[4, 4, 4, 4]}
              animationDuration={900}
              animationEasing="ease-out"
            >
              {sorted.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.wow_pct >= 0 ? 'url(#emerald-bar)' : 'url(#danger-bar)'}
                />
              ))}
              {/* Two label lists — positive values get labeled to the right of
                  the bar, negative values to the left. Recharts' "right" and
                  "left" positions are reliable even with negative domains. */}
              <LabelList
                dataKey="wow_pct"
                position="right"
                formatter={(v) => (v >= 0 ? `+${v.toFixed(0)}%` : '')}
                style={{ fill: '#047857', fontSize: 12, fontWeight: 700 }}
              />
              <LabelList
                dataKey="wow_pct"
                position="left"
                formatter={(v) => (v < 0 ? `${v.toFixed(0)}%` : '')}
                style={{ fill: '#b91c1c', fontSize: 12, fontWeight: 700 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.section>
  );
}

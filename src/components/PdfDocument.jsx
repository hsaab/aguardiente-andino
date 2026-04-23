import {
  Document,
  Font,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from '@react-pdf/renderer';
import { formatInt, formatMoney, formatPct } from '../lib/format.js';
import { buildChartData } from '../lib/briefingMetrics.js';
import { normalizeLanguage } from '../lib/briefingSchema.js';

// Bundle Inter + Fraunces from Google Fonts so the PDF looks like the app.
Font.register({
  family: 'Inter',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/inter/v20/UcCM3FwrK3iLTcvnUwkT9mI1F55MKw.ttf', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/inter/v20/UcCM3FwrK3iLTcvnUwkT9nk1HsJqywk.ttf', fontWeight: 600 },
    { src: 'https://fonts.gstatic.com/s/inter/v20/UcCM3FwrK3iLTcvnUwkT9mw1HsJqywk.ttf', fontWeight: 700 },
  ],
});
Font.register({
  family: 'Fraunces',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/fraunces/v42/6NUu8FaDKAorpLApHE4ktDGe7TeodlyO.ttf', fontWeight: 500 },
    { src: 'https://fonts.gstatic.com/s/fraunces/v42/6NUu8FaDKAorpLApHE4ktDGU6TeodlyO.ttf', fontWeight: 700 },
  ],
});

const COLORS = {
  emerald: '#065f46',
  emeraldBright: '#047857',
  gold: '#d97706',
  charcoal: '#18181b',
  muted: '#71717a',
  danger: '#b91c1c',
  border: '#e4e4e7',
  cream: '#fafaf7',
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 48,
    paddingBottom: 56,
    paddingHorizontal: 48,
    fontFamily: 'Inter',
    fontSize: 10,
    color: COLORS.charcoal,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerBrand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logo: { width: 72, height: 36 },
  tagline: {
    fontSize: 9,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    color: COLORS.emerald,
    fontWeight: 600,
  },
  week: { fontSize: 10, color: COLORS.muted },
  eyebrow: {
    fontSize: 8.5,
    textTransform: 'uppercase',
    letterSpacing: 1.4,
    color: COLORS.emerald,
    fontWeight: 600,
    marginBottom: 4,
  },
  h1: { fontFamily: 'Fraunces', fontSize: 26, fontWeight: 700, marginBottom: 10 },
  h2: { fontFamily: 'Fraunces', fontSize: 16, fontWeight: 700, marginBottom: 8 },
  summaryText: { fontFamily: 'Fraunces', fontSize: 13, lineHeight: 1.45, color: COLORS.charcoal },
  section: { marginTop: 16, paddingTop: 14, borderTopWidth: 1, borderTopColor: COLORS.border },
  columns: { flexDirection: 'row', gap: 14 },
  col: { flex: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  accountName: { fontWeight: 600, color: COLORS.charcoal },
  accountSub: { fontSize: 9, color: COLORS.muted, marginTop: 1 },
  accountNote: { fontSize: 9.5, color: '#3f3f46', marginTop: 3, lineHeight: 1.35 },
  metricPositive: { color: COLORS.emeraldBright, fontWeight: 700 },
  metricNegative: { color: COLORS.danger, fontWeight: 700 },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10,
  },
  actionBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.emerald,
    color: '#ffffff',
    fontFamily: 'Fraunces',
    fontWeight: 700,
    fontSize: 11,
    textAlign: 'center',
    paddingTop: 3,
  },
  actionTitle: { fontFamily: 'Fraunces', fontSize: 12, fontWeight: 700 },
  actionDetail: { fontSize: 10, color: '#3f3f46', marginTop: 2, lineHeight: 1.4 },
  footer: {
    position: 'absolute',
    bottom: 28,
    left: 48,
    right: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 8.5,
    color: COLORS.muted,
  },
  chartRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4, gap: 6 },
  chartLabel: { width: 140, fontSize: 9, color: COLORS.charcoal },
  chartBarTrack: { flex: 1, height: 12, flexDirection: 'row', alignItems: 'center' },
  chartBar: { height: 10, borderRadius: 2 },
  chartValue: { width: 38, fontSize: 9, textAlign: 'right', fontWeight: 700 },
});

/**
 * PDF document mirroring the on-screen briefing. The briefing carries its
 * own language; chart data is rebuilt deterministically from the input
 * rows. Monetary figures use the active currency.
 */
export default function PdfDocument({ briefing, rows, currency, logoUrl }) {
  const lang = normalizeLanguage(briefing?.language);
  const summary = typeof briefing.summary === 'string' ? briefing.summary : '';
  const chartData = buildChartData(rows);
  const titles =
    lang === 'es'
      ? {
          title: 'Briefing Semanal de Ventas',
          tagline: 'Inteligencia de Ventas Semanal',
          summary: 'Resumen ejecutivo',
          top: 'Top 3 cuentas en crecimiento',
          bottom: '3 cuentas en caída',
          threats: 'Amenazas de la competencia',
          promo: 'Eficiencia promocional',
          actions: 'Acciones de esta semana',
          chart: 'Crecimiento semanal por cuenta',
          footer: 'Potenciado por Claude · Preparado para el fundador',
          bottles: 'botellas',
          returns: 'devoluciones',
          soldOf: 'vendidas de',
          perBottle: '/botella',
        }
      : {
          title: 'Weekly Sales Briefing',
          tagline: 'Weekly Sales Intelligence',
          summary: 'Executive summary',
          top: 'Top 3 growing accounts',
          bottom: 'Bottom 3 accounts',
          threats: 'Competitor threats',
          promo: 'Promo efficiency',
          actions: "This week's actions",
          chart: 'Week-over-week growth by account',
          footer: 'Powered by Claude · Prepared for the founder',
          bottles: 'bottles',
          returns: 'returns',
          soldOf: 'sold',
          perBottle: '/bottle',
        };

  const maxAbs = Math.max(5, ...chartData.map((c) => Math.abs(c.wow_pct)));

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header} fixed>
          <View style={styles.headerBrand}>
            {logoUrl && <Image src={logoUrl} style={styles.logo} />}
            <Text style={styles.tagline}>{titles.tagline}</Text>
          </View>
          <Text style={styles.week}>{briefing.week_label}</Text>
        </View>

        {/* Hero summary */}
        <Text style={styles.eyebrow}>{titles.summary}</Text>
        <Text style={styles.h1}>{titles.title}</Text>
        <Text style={styles.summaryText}>{summary}</Text>

        {/* Top / Bottom columns */}
        <View style={styles.section}>
          <View style={styles.columns}>
            <View style={styles.col}>
              <Text style={styles.eyebrow}>{titles.top}</Text>
              {briefing.top_growers.map((g, i) => (
                <View key={g.account} style={styles.row}>
                  <View style={{ flex: 1, paddingRight: 6 }}>
                    <Text style={styles.accountName}>{i + 1}. {g.account}</Text>
                    <Text style={styles.accountSub}>
                      {g.region} · +{formatInt(g.bottles_delta)} {titles.bottles}
                    </Text>
                  </View>
                  <Text style={styles.metricPositive}>{formatPct(g.wow_pct)}</Text>
                </View>
              ))}
            </View>
            <View style={styles.col}>
              <Text style={styles.eyebrow}>{titles.bottom}</Text>
              {briefing.bottom_decliners.map((d, i) => (
                <View key={d.account} style={{ marginBottom: 8 }}>
                  <View style={styles.row}>
                    <View style={{ flex: 1, paddingRight: 6 }}>
                      <Text style={styles.accountName}>{i + 1}. {d.account}</Text>
                      <Text style={styles.accountSub}>
                        {d.region} · {d.returns} {titles.returns}
                      </Text>
                    </View>
                    <Text style={styles.metricNegative}>{formatPct(d.wow_pct)}</Text>
                  </View>
                  <Text style={styles.accountNote}>{d.reason}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Threats + Promo */}
        <View style={styles.section}>
          <View style={styles.columns}>
            <View style={styles.col}>
              <Text style={styles.eyebrow}>{titles.threats}</Text>
              {briefing.competitor_threats.map((th) => (
                <View key={th.account} style={{ marginBottom: 9 }}>
                  <View style={styles.row}>
                    <Text style={styles.accountName}>{th.account}</Text>
                    <Text style={{ color: COLORS.gold, fontWeight: 700, fontSize: 9 }}>
                      {th.winning_competitor}
                    </Text>
                  </View>
                  <Text style={styles.accountSub}>
                    {th.was_position} → {th.now_position}
                  </Text>
                  <Text style={styles.accountNote}>{th.note}</Text>
                </View>
              ))}
            </View>
            <View style={styles.col}>
              <Text style={styles.eyebrow}>{titles.promo}</Text>
              {briefing.promo_inefficiency.map((p) => (
                <View key={p.account} style={{ marginBottom: 9 }}>
                  <View style={styles.row}>
                    <Text style={styles.accountName}>{p.account}</Text>
                    <Text style={styles.metricNegative}>
                      {formatMoney(p.promo_spend_cop, currency)}
                    </Text>
                  </View>
                  <Text style={styles.accountSub}>
                    {formatInt(p.bottles_sold)} {titles.soldOf} · {formatMoney(p.waste_ratio, currency)}{titles.perBottle}
                  </Text>
                  <Text style={styles.accountNote}>{p.note}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <Text style={styles.eyebrow}>{titles.actions}</Text>
          {briefing.actions.map((a) => (
            <View key={a.priority} style={styles.actionRow}>
              <Text style={styles.actionBadge}>{a.priority}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.actionTitle}>{a.title}</Text>
                <Text style={styles.actionDetail}>{a.detail}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.footer} fixed>
          <Text>{titles.footer}</Text>
          <Text
            render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
          />
        </View>
      </Page>

      {/* Chart page */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header} fixed>
          <View style={styles.headerBrand}>
            {logoUrl && <Image src={logoUrl} style={styles.logo} />}
            <Text style={styles.tagline}>{titles.tagline}</Text>
          </View>
          <Text style={styles.week}>{briefing.week_label}</Text>
        </View>

        <Text style={styles.eyebrow}>{titles.chart}</Text>
        <Text style={styles.h2}>
          {chartData.length} {lang === 'es' ? 'cuentas' : 'accounts'}
        </Text>

        <View style={{ marginTop: 6 }}>
          {chartData.map((c) => (
            <ChartRow key={c.account} entry={c} maxAbs={maxAbs} />
          ))}
        </View>

        <View style={styles.footer} fixed>
          <Text>{titles.footer}</Text>
          <Text
            render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  );
}

function ChartRow({ entry, maxAbs }) {
  const pct = entry.wow_pct;
  const positive = pct >= 0;
  const widthPercent = Math.max(2, (Math.abs(pct) / maxAbs) * 50);
  return (
    <View style={styles.chartRow}>
      <Text style={styles.chartLabel}>{entry.account}</Text>
      <View style={styles.chartBarTrack}>
        {/* Center gutter for zero-axis */}
        <View style={{ flex: 1, height: '100%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
          <View style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: 0.5, backgroundColor: COLORS.border }} />
          {!positive && (
            <View
              style={{
                position: 'absolute',
                right: '50%',
                width: `${widthPercent}%`,
                ...styles.chartBar,
                backgroundColor: COLORS.danger,
              }}
            />
          )}
          {positive && (
            <View
              style={{
                position: 'absolute',
                left: '50%',
                width: `${widthPercent}%`,
                ...styles.chartBar,
                backgroundColor: COLORS.emeraldBright,
              }}
            />
          )}
          <View style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1, backgroundColor: COLORS.charcoal, opacity: 0.3 }} />
        </View>
      </View>
      <Text style={[styles.chartValue, { color: positive ? COLORS.emeraldBright : COLORS.danger }]}>
        {pct > 0 ? '+' : ''}{pct.toFixed(0)}%
      </Text>
    </View>
  );
}

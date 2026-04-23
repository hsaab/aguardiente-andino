// Canonical demo briefing. Used by the ?demo=seed URL param for offline
// rehearsal and as a last-resort fallback if both the API and localStorage
// cache fail. Hand-written to match the narrative across the 10 regional
// CSVs in public/sample-data/.
//
// Single-language shape (matches src/lib/briefingSchema.js). chart_data is
// computed client-side from the parsed rows, so the fixture omits it.

const COMMON = {
  week_label: 'Week 24, June 10–16, 2026',
  top_growers: [
    { account: 'Bar La Puerta Falsa', region: 'Bogotá', wow_pct: 39, bottles_delta: 25 },
    { account: 'Bar Amarillo Azul y Rojo', region: 'Villavicencio', wow_pct: 38, bottles_delta: 24 },
    { account: 'Éxito Villavicencio', region: 'Villavicencio', wow_pct: 34, bottles_delta: 40 },
  ],
};

export const DEMO_BRIEFING_EN = {
  ...COMMON,
  language: 'en',
  summary:
    'Sell-through is up 8% week-over-week, but the story is split across ten regions: Villavicencio and the Eje Cafetero posted standout double-digit growth, Medellín extended its run, while Bogotá narrowly offset three disasters and Cali contracted across every account. Antioqueño seized eye-level at Carulla Cedritos in Bogotá and now Carulla Cañaveral in Bucaramanga, and we are burning 4.4 million COP in promo on three accounts that are losing bottles.',
  bottom_decliners: [
    {
      account: 'Carulla Cedritos',
      region: 'Bogotá',
      wow_pct: -57,
      returns: 2,
      reason:
        'Antioqueño took our eye-level slot; we were demoted to the bottom shelf and volume halved.',
    },
    {
      account: 'Tienda Don Pepe',
      region: 'Bogotá',
      wow_pct: -41,
      returns: 11,
      reason:
        'Back-counter placement plus eleven returns on only 22 bottles sold, despite 1.8M COP in promo.',
    },
    {
      account: 'Tienda El Paisa Bogotá',
      region: 'Bogotá',
      wow_pct: -38,
      returns: 5,
      reason: 'Nariño displaced us to the back counter; the promo budget is buying invisibility.',
    },
  ],
  competitor_threats: [
    {
      account: 'Carulla Cedritos',
      was_position: 'Eye-level',
      now_position: 'Bottom Shelf',
      winning_competitor: 'Antioqueño',
      note: 'A flagship Bogotá supermarket: volume dropped from 168 to 72 bottles in a single week after the swap.',
    },
    {
      account: 'Carulla Cañaveral',
      was_position: 'Eye-level',
      now_position: 'Bottom Shelf',
      winning_competitor: 'Antioqueño',
      note: 'Antioqueño is pushing east into Santander: we just lost eye-level at a flagship Bucaramanga supermarket and volume dropped 28% in a week.',
    },
    {
      account: 'Tienda Don Pepe',
      was_position: 'Bottom Shelf',
      now_position: 'Back Counter',
      winning_competitor: 'Antioqueño',
      note: 'Further relegation — now literally out of sight. Customers cannot buy what they cannot see.',
    },
    {
      account: 'Bar La Topa Tolondra',
      was_position: 'Eye-level',
      now_position: 'Top Shelf',
      winning_competitor: 'Blanco del Valle',
      note: 'Cali pressure continues: Blanco del Valle displaced us at a flagship salsa bar last Thursday.',
    },
  ],
  promo_inefficiency: [
    {
      account: 'Tienda Don Pepe',
      promo_spend_cop: 1800000,
      bottles_sold: 22,
      waste_ratio: 81818,
      note: 'Worst ROI of the week: 82K COP per bottle on an account that is declining 41% WoW.',
    },
    {
      account: 'Tienda El Paisa Bogotá',
      promo_spend_cop: 1500000,
      bottles_sold: 18,
      waste_ratio: 83333,
      note: '83K COP per bottle on an account that shrunk 38%. Cancel the spend this week.',
    },
    {
      account: 'Tienda San Fernando',
      promo_spend_cop: 1100000,
      bottles_sold: 28,
      waste_ratio: 39286,
      note: 'A Cali corner store burning 1.1M COP for 28 bottles while the regional market contracts.',
    },
  ],
  actions: [
    {
      priority: 1,
      title: 'Visit Carulla Cedritos personally before Wednesday',
      detail:
        'Reclaim eye-level placement. Losing this spot to Antioqueño cut volume from 168 to 72 bottles in one week. Bring a sample case and the Medellín growth numbers to the category manager — this is a recoverable account if we move fast.',
    },
    {
      priority: 2,
      title: 'Reallocate 4.4M COP of wasted promo to Villavicencio and Pereira',
      detail:
        'Pull spend from Tienda Don Pepe, Tienda El Paisa Bogotá, and Tienda San Fernando. Redirect to Éxito Villavicencio, Bar Amarillo Azul y Rojo, and Bar El Gallo in Pereira — all growing 30%+ WoW on a fraction of the budget. Same 4.4M COP, triple the return.',
    },
    {
      priority: 3,
      title: 'Lock in eye-level at three bars across Medellín, Bucaramanga, and Villavicencio before Friday',
      detail:
        'Bar El Tibirí, Bar Mercagán, and Bar Amarillo Azul y Rojo are all growing double digits on minimal promo spend. Sign quarterly visibility agreements now, before Antioqueño or Néctar notice and counter-bid.',
    },
  ],
};

export const DEMO_BRIEFING_ES = {
  ...COMMON,
  language: 'es',
  summary:
    'Las ventas subieron 8% semana contra semana, pero la historia es diversa en diez regiones: Villavicencio y el Eje Cafetero registraron un crecimiento sobresaliente de dos dígitos, Medellín sostuvo su racha, mientras Bogotá apenas compensó tres desastres y Cali se contrajo en todas sus cuentas. Antioqueño tomó el nivel de visión en Carulla Cedritos en Bogotá y ahora en Carulla Cañaveral en Bucaramanga, y estamos quemando 4,4 millones de COP en promoción en tres cuentas que pierden botellas.',
  bottom_decliners: [
    {
      account: 'Carulla Cedritos',
      region: 'Bogotá',
      wow_pct: -57,
      returns: 2,
      reason:
        'Antioqueño tomó nuestra ubicación a nivel de visión; fuimos relegados a la repisa inferior y el volumen se redujo a la mitad.',
    },
    {
      account: 'Tienda Don Pepe',
      region: 'Bogotá',
      wow_pct: -41,
      returns: 11,
      reason:
        'Ubicación tras el mostrador con once devoluciones sobre 22 botellas vendidas, a pesar de 1.8M COP en promoción.',
    },
    {
      account: 'Tienda El Paisa Bogotá',
      region: 'Bogotá',
      wow_pct: -38,
      returns: 5,
      reason: 'Nariño nos relegó tras el mostrador; el presupuesto promocional está comprando invisibilidad.',
    },
  ],
  competitor_threats: [
    {
      account: 'Carulla Cedritos',
      was_position: 'Eye-level',
      now_position: 'Bottom Shelf',
      winning_competitor: 'Antioqueño',
      note: 'Supermercado emblemático en Bogotá: el volumen cayó de 168 a 72 botellas en una sola semana tras el cambio.',
    },
    {
      account: 'Carulla Cañaveral',
      was_position: 'Eye-level',
      now_position: 'Bottom Shelf',
      winning_competitor: 'Antioqueño',
      note: 'Antioqueño avanza hacia el oriente en Santander: perdimos el nivel de visión en un supermercado emblemático de Bucaramanga y el volumen cayó 28% en una semana.',
    },
    {
      account: 'Tienda Don Pepe',
      was_position: 'Bottom Shelf',
      now_position: 'Back Counter',
      winning_competitor: 'Antioqueño',
      note: 'Relegación adicional — ahora literalmente fuera de vista. El cliente no compra lo que no ve.',
    },
    {
      account: 'Bar La Topa Tolondra',
      was_position: 'Eye-level',
      now_position: 'Top Shelf',
      winning_competitor: 'Blanco del Valle',
      note: 'La presión en Cali no cede: Blanco del Valle nos desplazó en un bar de salsa emblemático el jueves pasado.',
    },
  ],
  promo_inefficiency: [
    {
      account: 'Tienda Don Pepe',
      promo_spend_cop: 1800000,
      bottles_sold: 22,
      waste_ratio: 81818,
      note: 'El peor retorno de la semana: 82K COP por botella en una cuenta que cae 41% semanal.',
    },
    {
      account: 'Tienda El Paisa Bogotá',
      promo_spend_cop: 1500000,
      bottles_sold: 18,
      waste_ratio: 83333,
      note: '83K COP por botella en una cuenta que se contrajo 38%. Cancele el gasto esta semana.',
    },
    {
      account: 'Tienda San Fernando',
      promo_spend_cop: 1100000,
      bottles_sold: 28,
      waste_ratio: 39286,
      note: 'Tienda de barrio en Cali quemando 1.1M COP por 28 botellas mientras el mercado regional se contrae.',
    },
  ],
  actions: [
    {
      priority: 1,
      title: 'Visite personalmente Carulla Cedritos antes del miércoles',
      detail:
        'Recupere la ubicación a nivel de visión. Perder este espacio ante Antioqueño cortó el volumen de 168 a 72 botellas en una semana. Lleve una caja de muestra y los números de crecimiento de Medellín al gerente de categoría — es una cuenta recuperable si actuamos rápido.',
    },
    {
      priority: 2,
      title: 'Reasigne 4,4M COP de promoción desperdiciada a Villavicencio y Pereira',
      detail:
        'Retire el gasto de Tienda Don Pepe, Tienda El Paisa Bogotá y Tienda San Fernando. Redirija a Éxito Villavicencio, Bar Amarillo Azul y Rojo y Bar El Gallo en Pereira — todas crecen más del 30% semanal con una fracción del presupuesto. Mismos 4,4M COP, el triple de retorno.',
    },
    {
      priority: 3,
      title: 'Asegure el nivel de visión en tres bares de Medellín, Bucaramanga y Villavicencio antes del viernes',
      detail:
        'Bar El Tibirí, Bar Mercagán y Bar Amarillo Azul y Rojo crecen a dos dígitos con mínima promoción. Firme acuerdos trimestrales de visibilidad ahora, antes de que Antioqueño o Néctar se enteren y contra-oferten.',
    },
  ],
};

/**
 * Pick the demo briefing for a given UI language. Defaults to English.
 */
export function pickDemoBriefing(lang) {
  return lang === 'es' ? DEMO_BRIEFING_ES : DEMO_BRIEFING_EN;
}

// Backwards-compat default for any caller importing the legacy name.
export const DEMO_BRIEFING = DEMO_BRIEFING_EN;

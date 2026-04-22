# Aguardiente Andino — Weekly Sales Intelligence

A live demo app built for the **AI Summit Colombia** keynote stage. Upload a
weekly sales CSV, click **Generate**, and watch Claude Sonnet 4.5 turn raw
spreadsheet rows into a polished, bilingual (EN / ES) executive briefing —
complete with growth charts and a one-click PDF export.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-3-38BDF8?logo=tailwindcss&logoColor=white)
![Claude](https://img.shields.io/badge/Claude-Sonnet%204.5-D97757)

---

## Features

- **CSV → Briefing in one click.** Drag-and-drop a weekly sales CSV and Claude
  returns a structured, multi-section briefing grounded in the actual numbers.
- **Bilingual by design.** Every narrative field is emitted in both English and
  Colombian Spanish; toggle the language at any time without re-hitting the API.
- **Currency toggle.** Switch between COP and USD on the fly (FX handled
  client-side, no extra tokens).
- **PDF export.** `@react-pdf/renderer` produces a branded, shareable PDF of the
  current briefing.
- **Keynote-safe fallbacks.** Two demo modes (`?demo=seed`, `?demo=cached`) and
  an automatic offline fallback if the API call fails — the demo never
  dead-ends.
- **Thoughtful UX touches.** Idle-cursor hiding, keyboard shortcut to reset
  (`R`), and animated stage transitions via Framer Motion.

## Quick start

```bash
git clone https://github.com/hsaab/aguardiente-andino.git
cd aguardiente-andino
npm install
cp .env.example .env.local        # paste your Anthropic API key
npm run dev
```

Open <http://localhost:5173>.

## Environment

| Variable | Required | Notes |
|---|---|---|
| `VITE_ANTHROPIC_API_KEY` | yes | Anthropic API key. **Warning:** `VITE_`-prefixed env vars are embedded into the client bundle at build time — anyone visiting the deployed site can read the key. For the live keynote, use a dedicated key with a low spend cap and rotate it after the event. For any long-lived deployment, proxy through a server route instead of shipping the key to the browser. |

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite dev server at <http://localhost:5173> |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint across the project |

## Demo controls

- **Drag-and-drop** a CSV anywhere on the upload screen, or click **Use sample
  data** to load `public/sample-data.csv` (42 accounts, hand-crafted narrative).
- **Language toggle** (EN / ES) and **currency toggle** (COP / USD) in the
  header swap instantly — the briefing already carries both languages.
- **`R`** key (or the reset button) returns to the upload screen.
- **`?demo=seed`** jumps straight to a bundled fixture briefing (rehearsal
  mode).
- **`?demo=cached`** replays the last saved briefing from `localStorage` with a
  theatrical delay — useful as an offline fallback if venue wifi is flaky.
- On any API failure, the app automatically falls back to the cached briefing.

## Architecture

```
src/
  App.jsx               Stage machine (upload → preview → generating → briefing)
  components/           UI components
    Header.jsx          Language + currency toggles, reset
    UploadZone.jsx      Drag-and-drop CSV ingest
    DataPreview.jsx     Parsed CSV summary before generation
    LoadingState.jsx    Animated generating state
    BriefingView.jsx    Composes the final briefing
    SectionCard.jsx     Reusable briefing section layout
    HeroMetric.jsx      Headline number with trend
    GrowthChart.jsx     Recharts-based week-over-week chart
    PdfDocument.jsx     @react-pdf/renderer export
  lib/                  Pure logic (no React)
    anthropic.js        Claude client + response parsing
    briefingSchema.js   Shape contract Claude must return
    csv.js              Papaparse wrapper + validation
    format.js           Number / currency / percent helpers
    cache.js            localStorage helpers + demo-mode flags
    pdf.js              PDF download trigger, logo loader
  prompts/              Prompt templates (weeklyBriefing)
  i18n/                 UI strings in EN and ES
  hooks/
    useKeyboardShortcut.js
    useIdleCursor.js
  demo/
    fixture.js          Bundled demo briefing for ?demo=seed
```

Claude is instructed to return a single JSON object (shape defined in
`src/lib/briefingSchema.js`) with every narrative field populated in both
English and Colombian Spanish. That single object powers the on-screen
briefing, the growth chart, and the PDF export — no second round-trip needed
when the user toggles language.

## CSV schema

| Column | Type | Notes |
|---|---|---|
| `account_name` | string | |
| `account_type` | enum | Supermarket / Corner Store / Bar / Restaurant |
| `region` | enum | Bogotá / Medellín / Cali / Barranquilla / Cartagena |
| `bottles_sold_this_week` | integer | |
| `bottles_sold_last_week` | integer | |
| `returns_this_week` | integer | |
| `shelf_position` | enum | Eye-level / Top Shelf / Bottom Shelf / Back Counter / Not Stocked |
| `top_competitor_on_shelf` | string | Antioqueño, Nariño, Cristal, Blanco del Valle, Néctar |
| `promo_spend_cop` | integer | Colombian pesos |

A working example lives at `public/sample-data.csv`.

## Cost

Claude Sonnet 4.5 pricing: **$3/M input, $15/M output tokens**. Each generation
uses roughly 2–3k input + 1–2k output tokens (doubled because the briefing is
emitted in both languages in a single call).

**Typical cost per briefing: ~$0.04–0.06.**

## Tech stack

- **[React 19](https://react.dev/)** + **[Vite 8](https://vitejs.dev/)** — app
  framework and dev server
- **[Tailwind CSS 3](https://tailwindcss.com/)** — styling
- **[Framer Motion](https://www.framer.com/motion/)** — stage transitions
- **[Recharts](https://recharts.org/)** — growth chart
- **[@react-pdf/renderer](https://react-pdf.org/)** — PDF export
- **[Papa Parse](https://www.papaparse.com/)** — CSV parsing
- **[@anthropic-ai/sdk](https://github.com/anthropics/anthropic-sdk-typescript)**
  — Claude client

## License

Demo / keynote project. No license granted — please ask before reusing.

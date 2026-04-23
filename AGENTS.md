# AGENTS.md — Aguardiente Andino

## Why this repo exists — read first

This app is a **live, on-stage conference demo** running in front of a real audience. The operator drives Cursor live; every change must be safe to ship to a projector in real time.

Risk posture for any change you propose:

- **Conservatism wins.** If a task has two plausible shapes and one is smaller / more local / reuses an existing primitive, pick that one.
- **Don't improve things that weren't asked about.** No unsolicited refactors, renames, dep bumps, file moves, lint fixes, or "while I'm here" cleanups.
- **Never break the happy path.** `?demo=seed` and `?demo=cached` must keep working after every edit — they are the fallback if the venue wifi dies mid-talk.
- **If in doubt, stop and ask.** A clarifying question costs 10 seconds. A silent wrong guess costs the demo.

This file is read by Cursor at the start of every session. Read `.cursor/rules/` for enforced guardrails.

## What this app is

A pure Vite + React 19 SPA. Drag-and-drop a weekly sales CSV → call Claude Sonnet 4.6 directly from the browser → render a bilingual (EN/ES) executive briefing with growth chart and PDF export. No backend.

Entry: [src/main.jsx](src/main.jsx) → [src/App.jsx](src/App.jsx).

## Stage machine

`App.jsx` is a 4-state finite machine on `stage`:

```
upload → preview → generating → briefing
```

Demo modes (`?demo=seed` and `?demo=cached`) short-circuit directly into the `briefing` stage after a theatrical delay. Both are keynote safety nets — do not remove them.

## Directory map

```
src/
  App.jsx                  Stage machine + side effects
  components/              All React UI (functional components only)
    BriefingView.jsx       The rendered report — assumes a complete briefing
    SectionCard.jsx        Reusable section container (reuse for new blocks)
    HeroMetric.jsx, GrowthChart.jsx, PdfDocument.jsx, LoadingState.jsx
    UploadZone.jsx, DataPreview.jsx, Header.jsx
  lib/                     Pure logic, no React
    anthropic.js           Claude client + response parsing (MODEL is frozen)
    briefingSchema.js      FROZEN — the contract between model and UI
    briefingMetrics.js     Hero stat + chart data derivation from rows
    csv.js, format.js, cache.js, pdf.js
  prompts/
    weeklyBriefing.js      FROZEN — system + user prompts
  i18n/strings.js          EN/ES UI strings — extend here for new copy
  hooks/                   useKeyboardShortcut, useIdleCursor
  demo/fixture.js          FROZEN — bundled fixture briefing for ?demo=seed
public/
  sample-data/             Rehearsal CSVs
  logo.png                 Used by PdfDocument
```

## Frozen files — do not edit without explicit ask

- `src/lib/briefingSchema.js`
- `src/prompts/weeklyBriefing.js`
- `src/demo/fixture.js`
- `public/sample-data/*.csv`
- `public/logo.png`

The model name `claude-sonnet-4-6` in [src/lib/anthropic.js](src/lib/anthropic.js) is also frozen.

## Where to add new code

| Kind of change | Home |
|---|---|
| New pure helper (parsing, formatting, API call) | new file in `src/lib/` |
| New React component | new file in `src/components/`, wrap in `SectionCard` when possible |
| New hook | `src/hooks/useXxx.js` |
| New user-facing copy | add keys to both `en` and `es` in `src/i18n/strings.js` |

Keep files under 300 lines. No TypeScript. Tailwind classes only (tokens in [tailwind.config.js](tailwind.config.js): `charcoal`, `cream`, `emerald-*`, `gold-*`, `danger`, `muted`). No inline `style={}` unless matching existing patterns. No new npm deps without approval — `partial-json` is already installed.

## Scripts

```bash
npm run dev        # Vite dev server at http://localhost:5173
npm run build      # production build
npm run lint       # ESLint (see note below)
```

Pre-existing lint noise: 7 `motion` unused-var errors and 1 unused-disable warning. Do not introduce new errors, but those 8 may stay.

## Demo-safety non-negotiables

- The `catch` branch in `handleGenerate` that falls back to `loadBriefing()` **must** stay.
- The `?demo=seed` / `?demo=cached` `useEffect` **must** stay.
- The `stop_reason === 'max_tokens'` guard in `src/lib/anthropic.js` **must** stay.
- `dangerouslyAllowBrowser: true` and the ephemeral `cache_control` on the system prompt **must** stay.

## Active rule files

- [.cursor/rules/always.mdc](.cursor/rules/always.mdc) — invariants applied to every change
- [.cursor/rules/streaming.mdc](.cursor/rules/streaming.mdc) — recipe for adding streaming to the briefing flow
- [.cursor/rules/chat.mdc](.cursor/rules/chat.mdc) — recipe for adding the inline chat on the briefing page

// Minimal localStorage cache for the most recent briefing.
// Used by the ?demo=cached URL param as a keynote-safe fallback.

// v2: single-language flat-string briefing shape (no chart_data echoed by
// the model). Bumping the key drops any v1 bilingual blob so the renderer
// never has to defend against the old shape.
const KEY = 'aguardiente.lastBriefing.v2';

export function saveBriefing(briefing) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ briefing, savedAt: Date.now() }));
  } catch {
    // Ignore quota / private-mode errors — caching is best effort.
  }
}

export function loadBriefing() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.briefing ?? null;
  } catch {
    return null;
  }
}

export function isDemoCachedMode() {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  return params.get('demo') === 'cached';
}

export function isDemoSeedMode() {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  return params.get('demo') === 'seed';
}

// Minimal localStorage cache for the most recent briefing.
// Used by the ?demo=cached URL param as a keynote-safe fallback.

const KEY = 'aguardiente.lastBriefing.v1';

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

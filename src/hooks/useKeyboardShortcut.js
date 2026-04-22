import { useEffect } from 'react';

/**
 * Bind a keyboard shortcut to a handler. Skips when the user is typing in
 * an input or has a modifier key the caller did not request.
 */
export default function useKeyboardShortcut(key, handler, { enabled = true } = {}) {
  useEffect(() => {
    if (!enabled) return;
    function onKey(e) {
      const tag = e.target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target?.isContentEditable) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key.toLowerCase() === key.toLowerCase()) {
        e.preventDefault();
        handler(e);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [key, handler, enabled]);
}

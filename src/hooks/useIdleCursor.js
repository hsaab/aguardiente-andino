import { useEffect } from 'react';

/**
 * Hide the mouse cursor after a period of inactivity so it doesn't distract
 * on the projector during the keynote. Cursor returns on any movement.
 */
export default function useIdleCursor({ idleMs = 2500 } = {}) {
  useEffect(() => {
    let timeoutId;
    const showCursor = () => {
      document.body.style.cursor = '';
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        document.body.style.cursor = 'none';
      }, idleMs);
    };
    showCursor();
    window.addEventListener('mousemove', showCursor);
    window.addEventListener('keydown', showCursor);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('mousemove', showCursor);
      window.removeEventListener('keydown', showCursor);
      document.body.style.cursor = '';
    };
  }, [idleMs]);
}

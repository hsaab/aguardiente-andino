import { useCallback, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { parseCsv, loadSampleCsv } from '../lib/csv.js';
import { useStrings } from '../i18n/strings.js';

/**
 * Drag-and-drop + file picker for the weekly CSV.
 * Also exposes a "Use sample data" link for a zero-friction demo path.
 */
export default function UploadZone({ lang, onLoaded }) {
  const t = useStrings(lang);
  const inputRef = useRef(null);
  const [isDragging, setDragging] = useState(false);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const handleFile = useCallback(
    async (file) => {
      setError(null);
      setBusy(true);
      try {
        const { rows } = await parseCsv(file);
        onLoaded(rows);
      } catch (err) {
        setError(err.message || String(err));
      } finally {
        setBusy(false);
      }
    },
    [onLoaded]
  );

  const handleSample = useCallback(async () => {
    setError(null);
    setBusy(true);
    try {
      const { rows } = await loadSampleCsv();
      onLoaded(rows);
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setBusy(false);
    }
  }, [onLoaded]);

  const onDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer?.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  return (
    <motion.section
      layoutId="stage-card"
      className="mx-auto max-w-3xl text-center"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <span className="eyebrow">{t.tagline}</span>
      <h1 className="mt-4 font-display text-5xl md:text-6xl font-semibold text-charcoal tracking-tight">
        {t.uploadTitle}
      </h1>
      <p className="mt-5 text-lg text-muted max-w-xl mx-auto">
        {t.uploadHint}
      </p>

      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click();
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={[
          'mt-12 cursor-pointer rounded-2xl border-2 border-dashed bg-surface p-16 transition-all duration-300',
          isDragging
            ? 'border-emerald-800 bg-emerald-50 scale-[1.01] shadow-card-hover'
            : 'border-emerald-800/20 hover:border-emerald-800/40 hover:shadow-card-hover',
        ].join(' ')}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = '';
          }}
        />

        <div className="flex flex-col items-center gap-5">
          <div className="h-16 w-16 rounded-full bg-emerald-50 flex items-center justify-center">
            <svg
              className="h-8 w-8 text-emerald-800"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
              />
            </svg>
          </div>
          <div className="text-lg font-medium text-charcoal">
            {busy ? 'Reading file…' : t.uploadHint}
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              inputRef.current?.click();
            }}
            className="btn-primary"
            disabled={busy}
          >
            {t.uploadChoose}
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleSample();
            }}
            className="text-sm font-medium text-emerald-800 underline-offset-4 hover:underline disabled:opacity-50"
            disabled={busy}
          >
            {t.uploadSample}
          </button>
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-6 text-sm text-danger">
          {error}
        </p>
      )}

      <p className="mt-8 text-xs text-muted max-w-2xl mx-auto leading-relaxed">
        {t.uploadColumns}
      </p>
    </motion.section>
  );
}

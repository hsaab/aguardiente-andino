import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, LayoutGroup } from 'framer-motion';
import Header from './components/Header.jsx';
import UploadZone from './components/UploadZone.jsx';
import DataPreview from './components/DataPreview.jsx';
import LoadingState from './components/LoadingState.jsx';
import BriefingView from './components/BriefingView.jsx';
import PdfDocument from './components/PdfDocument.jsx';
import { useStrings } from './i18n/strings.js';
import { generateBriefing } from './lib/anthropic.js';
import { isDemoCachedMode, isDemoSeedMode, loadBriefing, saveBriefing } from './lib/cache.js';
import { downloadPdf, getLogoDataUrl } from './lib/pdf.js';
import { loadSampleCsv } from './lib/csv.js';
import { DEMO_BRIEFING } from './demo/fixture.js';
import useKeyboardShortcut from './hooks/useKeyboardShortcut.js';
import useIdleCursor from './hooks/useIdleCursor.js';

/**
 * Top-level stage machine: upload -> preview -> generating -> briefing
 * Also owns language, currency, and cached-mode behaviour.
 */
export default function App() {
  const [lang, setLang] = useState('en');
  const [currency, setCurrency] = useState('COP');
  const [stage, setStage] = useState('upload');
  const [rows, setRows] = useState(null);
  const [briefing, setBriefing] = useState(null);
  const [isCached, setIsCached] = useState(false);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const t = useStrings(lang);

  useIdleCursor({ idleMs: 2500 });

  // Demo modes:
  //   ?demo=seed   — jump straight to the bundled fixture briefing (rehearsal)
  //   ?demo=cached — replay the last localStorage briefing with a delay
  // Both serve as keynote-safe fallbacks if the API or wifi misbehave.
  useEffect(() => {
    const seed = isDemoSeedMode();
    const cachedMode = isDemoCachedMode();
    if (!seed && !cachedMode) return;
    const source = seed ? DEMO_BRIEFING : loadBriefing();
    if (!source) return;
    (async () => {
      try {
        const { rows: sampleRows } = await loadSampleCsv();
        setRows(sampleRows);
        setStage('generating');
        await new Promise((r) => setTimeout(r, seed ? 2800 : 4200));
        setBriefing(source);
        setIsCached(true);
        setStage('briefing');
      } catch (err) {
        console.error('[demo-mode] failed', err);
      }
    })();
  }, []);

  const handleLoaded = useCallback((parsedRows) => {
    setRows(parsedRows);
    setStage('preview');
  }, []);

  const handleReset = useCallback(() => {
    setRows(null);
    setBriefing(null);
    setIsCached(false);
    setError(null);
    setStage('upload');
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!rows) return;
    setError(null);
    setIsCached(false);
    setStage('generating');

    // Guarantee a minimum theatrical wait so the loading animation has room
    // to play fully. The real API call usually takes 3-6s anyway.
    const minWait = new Promise((r) => setTimeout(r, 3600));
    try {
      const [{ briefing: b }] = await Promise.all([generateBriefing(rows), minWait]);
      setBriefing(b);
      saveBriefing(b);
      setStage('briefing');
    } catch (err) {
      console.error('[app] generation failed', err);
      // Fall back to cached briefing if available so the demo never dead-ends.
      const cached = loadBriefing();
      if (cached) {
        setBriefing(cached);
        setIsCached(true);
        setStage('briefing');
      } else {
        setError(err);
        setStage('preview');
      }
    }
  }, [rows]);

  const handleDownloadPdf = useCallback(async () => {
    if (!briefing) return;
    setDownloading(true);
    try {
      const logoUrl = await getLogoDataUrl();
      await downloadPdf(
        <PdfDocument
          briefing={briefing}
          lang={lang}
          currency={currency}
          logoUrl={logoUrl}
        />,
        `aguardiente-andino-${briefing.week_label.replace(/[^\w]+/g, '-').toLowerCase()}.pdf`
      );
    } catch (err) {
      console.error('[pdf] download failed', err);
    } finally {
      setDownloading(false);
    }
  }, [briefing, lang, currency]);

  useKeyboardShortcut('r', handleReset, { enabled: stage !== 'upload' });

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <Header
        lang={lang}
        setLang={setLang}
        currency={currency}
        setCurrency={setCurrency}
      />

      <main className="flex-1 container-content py-14 md:py-20">
        <LayoutGroup>
          <AnimatePresence mode="wait">
            {stage === 'upload' && (
              <UploadZone key="upload" lang={lang} onLoaded={handleLoaded} />
            )}
            {stage === 'preview' && rows && (
              <DataPreview
                key="preview"
                rows={rows}
                lang={lang}
                currency={currency}
                onGenerate={handleGenerate}
                onReset={handleReset}
              />
            )}
            {stage === 'generating' && (
              <LoadingState key="loading" lang={lang} accountsCount={rows?.length ?? 0} />
            )}
            {stage === 'briefing' && briefing && (
              <div key="briefing">
                <BriefingView
                  briefing={briefing}
                  lang={lang}
                  currency={currency}
                  rows={rows}
                  isCached={isCached}
                />
                <div className="mt-14 flex flex-wrap items-center justify-center gap-4">
                  <button
                    onClick={handleDownloadPdf}
                    className="btn-primary"
                    disabled={downloading}
                  >
                    <DownloadIcon />
                    {downloading
                      ? (lang === 'es' ? 'Generando PDF…' : 'Generating PDF…')
                      : t.downloadPdf}
                  </button>
                  <button onClick={handleReset} className="btn-ghost">
                    {t.reset}
                    <kbd className="ml-2 px-1.5 py-0.5 text-xs rounded bg-charcoal/5 border border-charcoal/10">R</kbd>
                  </button>
                </div>
              </div>
            )}
          </AnimatePresence>
          {error && stage === 'preview' && (
            <div className="mx-auto max-w-2xl mt-8 rounded-lg border border-danger/30 bg-danger/5 p-5 text-center">
              <div className="font-semibold text-danger">{t.errorTitle}</div>
              <div className="mt-1 text-sm text-charcoal/80">
                {error.code === 'MISSING_KEY' ? t.missingKey : (error.message || t.errorBody)}
              </div>
            </div>
          )}
        </LayoutGroup>
      </main>

      <footer className="border-t border-charcoal/10 py-8">
        <div className="container-content text-center text-sm text-muted">
          {t.footer}
        </div>
      </footer>
    </div>
  );
}

function DownloadIcon() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
  );
}

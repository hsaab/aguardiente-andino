import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { useStrings } from '../i18n/strings.js';

const MotionSection = motion.section;
const MotionH2 = motion.h2;
const MotionSpan = motion.span;

/**
 * Theatrical loading state for the briefing generation.
 * Cycles through real-sounding analysis phases so the 4-8s wait feels
 * intentional and editorial instead of like a chatbot delay.
 */
export default function LoadingState({ lang, accountsCount }) {
  const t = useStrings(lang);
  const [phaseIndex, setPhaseIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setPhaseIndex((i) => (i + 1) % t.phases.length);
    }, 1400);
    return () => clearInterval(id);
  }, [t.phases.length]);

  return (
    <MotionSection
      layoutId="stage-card"
      className="mx-auto max-w-2xl text-center"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex flex-col items-center gap-6 py-8">
        <PulseRing />
        <div>
          <span className="eyebrow">{t.generatingTitle}</span>
          <div className="mt-4 min-h-[3.5rem] flex items-center justify-center">
            <AnimatePresence mode="wait">
              <MotionH2
                key={phaseIndex}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.35 }}
                className="font-display text-2xl md:text-3xl font-medium text-charcoal"
              >
                {t.phases[phaseIndex]}
              </MotionH2>
            </AnimatePresence>
          </div>
          {accountsCount > 0 && (
            <p className="mt-4 text-sm text-muted">
              {lang === 'es'
                ? `${accountsCount} cuentas analizadas`
                : `${accountsCount} accounts under review`}
            </p>
          )}
        </div>
      </div>
    </MotionSection>
  );
}

function PulseRing() {
  return (
    <div className="relative h-16 w-16">
      <MotionSpan
        className="absolute inset-0 rounded-full border-2 border-emerald-800"
        animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />
      <MotionSpan
        className="absolute inset-2 rounded-full border-2 border-gold-600"
        animate={{ scale: [1, 1.25, 1], opacity: [0.8, 0.1, 0.8] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
      />
      <span className="absolute inset-5 rounded-full bg-emerald-800" />
    </div>
  );
}

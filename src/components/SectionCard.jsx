import { motion } from 'framer-motion';

const MotionSection = motion.section;

/**
 * Reusable card wrapper for briefing sections. Accepts an eyebrow, a headline,
 * and animates in as part of a stagger-fade sequence.
 */
export default function SectionCard({ eyebrow, title, children, className = '', accent = 'emerald' }) {
  const accentClass =
    accent === 'gold'
      ? 'border-l-gold-600'
      : accent === 'danger'
        ? 'border-l-danger'
        : 'border-l-emerald-800';

  return (
    <MotionSection
      variants={{
        hidden: { opacity: 0, y: 12 },
        visible: { opacity: 1, y: 0 },
      }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className={`card card-hover border-l-4 ${accentClass} p-7 ${className}`}
    >
      {eyebrow && <div className="eyebrow">{eyebrow}</div>}
      {title && (
        <h3 className="mt-2 font-display text-2xl md:text-3xl font-semibold text-charcoal">
          {title}
        </h3>
      )}
      <div className={title || eyebrow ? 'mt-5' : ''}>{children}</div>
    </MotionSection>
  );
}

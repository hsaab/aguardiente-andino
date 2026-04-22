import { useEffect, useRef } from 'react';
import { animate, useInView, useMotionValue, useTransform, motion } from 'framer-motion';

/**
 * Large Fraunces number that counts up when scrolled into view.
 * Useful for the hero stats on the briefing page.
 */
export default function HeroMetric({
  value,
  formatValue = (v) => Math.round(v).toString(),
  duration = 1.4,
  className = '',
  signed = false,
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-10% 0px' });
  const mv = useMotionValue(0);
  const display = useTransform(mv, (latest) => {
    const rounded = signed ? latest : Math.abs(latest);
    const formatted = formatValue(rounded);
    if (signed && latest > 0) return `+${formatted}`;
    if (signed && latest < 0) return `-${formatted}`;
    return formatted;
  });

  useEffect(() => {
    if (!inView) return;
    const controls = animate(mv, value, { duration, ease: [0.22, 1, 0.36, 1] });
    return () => controls.stop();
  }, [inView, value, duration, mv]);

  return (
    <motion.span ref={ref} className={`font-display tabular-nums ${className}`}>
      {display}
    </motion.span>
  );
}

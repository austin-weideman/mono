/**
 * Reusable framer-motion prop bundles. Spread onto any `motion.*` element.
 *
 *   <motion.button {...popMotion} {...tactileMotion}>…</motion.button>
 *   <motion.h2 {...withDelay(riseMotion, 0.15)}>…</motion.h2>
 */

// Snappy entrance: scales up from 0 with a rotation kick and spring overshoot.
export const popMotion = {
  initial: { scale: 0, rotate: -45, opacity: 0 },
  animate: { scale: 1, rotate: 0, opacity: 1 },
  exit: { scale: 0, rotate: 45, opacity: 0 },
  transition: {
    type: "spring" as const,
    stiffness: 600,
    damping: 18,
    mass: 0.6,
  },
};

// Tactile hover/tap response for interactive elements (buttons, icon buttons).
export const tactileMotion = {
  whileHover: { scale: 1.08 },
  whileTap: { scale: 0.9 },
};

// Quick fade-in. Good for message lists or anything that should appear smoothly
// without drawing attention to itself.
export const fadeMotion = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.15, ease: "easeOut" as const },
};

// Calm entrance: fade + small upward slide. Good for text and content blocks.
export const riseMotion = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: {
    duration: 0.4,
    ease: [0.22, 1, 0.36, 1] as const,
  },
};

// Returns a copy of a preset with a transition delay applied — for staggering
// sibling elements without reaching for variants/staggerChildren.
export function withDelay<T extends { transition?: object }>(
  preset: T,
  delay: number,
): T {
  return {
    ...preset,
    transition: { ...(preset.transition ?? {}), delay },
  };
}

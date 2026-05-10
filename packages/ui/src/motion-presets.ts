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

// Scroll-triggered rise: fades + lifts up when the element enters the viewport.
// Spread on any motion.* element to reveal it once on scroll.
export const viewportRiseMotion = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: {
    duration: 0.55,
    ease: [0.22, 1, 0.36, 1] as const,
  },
};

// Subtle press response for buttons. Less aggressive than tactileMotion —
// designed for primary CTAs where we want a soft, premium feel.
export const pressMotion = {
  whileHover: { scale: 1.03 },
  whileTap: { scale: 0.97 },
  transition: { type: "spring" as const, stiffness: 500, damping: 25 },
};

// Subtle hover lift for cards. Pairs well with shadow transitions in CSS.
export const liftMotion = {
  whileHover: { y: -4 },
  transition: { type: "spring" as const, stiffness: 400, damping: 25 },
};

// Container that staggers its motion children when scrolled into view.
// Pair with `staggerItemMotion` on each child.
export const staggerContainerMotion = {
  initial: "hidden",
  whileInView: "visible",
  viewport: { once: true, margin: "-80px" },
  variants: {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.09,
        delayChildren: 0.05,
      },
    },
  },
};

// Child of a `staggerContainerMotion` — fades + lifts in sequence with siblings.
export const staggerItemMotion = {
  variants: {
    hidden: { opacity: 0, y: 18 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    },
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

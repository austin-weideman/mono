"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";

import {
  cn,
  staggerContainerMotion,
  staggerItemMotion,
  viewportRiseMotion,
  withDelay,
} from "@mono/ui";

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "section" | "span" | "li" | "p";
}

/**
 * Fades + lifts a block into view on scroll. One-shot — once visible, stays.
 * Use at the section level, or as a fine-grained wrapper around a single
 * heading/paragraph/button row when you want sequenced entrance.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  as = "div",
}: RevealProps) {
  const MotionTag = motion[as];
  const props = delay
    ? withDelay(viewportRiseMotion, delay)
    : viewportRiseMotion;
  return (
    <MotionTag {...props} className={className}>
      {children}
    </MotionTag>
  );
}

interface RevealStaggerProps {
  children: ReactNode;
  className?: string;
  as?: "div" | "ul" | "ol" | "section";
}

/**
 * Parent that drives a sequenced reveal of its `RevealItem` children. Children
 * stay invisible until the parent enters the viewport, then animate in series.
 */
export function RevealStagger({
  children,
  className,
  as = "div",
}: RevealStaggerProps) {
  const MotionTag = motion[as];
  return (
    <MotionTag {...staggerContainerMotion} className={className}>
      {children}
    </MotionTag>
  );
}

interface RevealItemProps {
  children: ReactNode;
  className?: string;
  as?: "div" | "li" | "section" | "article" | "figure";
}

export function RevealItem({
  children,
  className,
  as = "div",
}: RevealItemProps) {
  const MotionTag = motion[as];
  return (
    <MotionTag {...staggerItemMotion} className={className}>
      {children}
    </MotionTag>
  );
}

interface HoverCardProps {
  children: ReactNode;
  className?: string;
  /** When true, applies a soft shadow boost on hover via CSS. */
  shadowed?: boolean;
}

/**
 * Card with a subtle spring-driven lift on hover and an optional shadow boost.
 * Wrap testimonial cards, pricing cards, and the hero preview card.
 */
export function HoverCard({
  children,
  className,
  shadowed = false,
}: HoverCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={cn(
        "transition-shadow duration-300",
        shadowed && "hover:shadow-[0_12px_32px_-12px_rgba(0,0,0,0.18)]",
        className,
      )}
    >
      {children}
    </motion.div>
  );
}

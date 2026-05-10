"use client";

import { motion } from "framer-motion";

import { staggerItemMotion } from "@microlearn/ui";

import { TESTIMONIALS_SECTION } from "../_lib/content";
import { RevealStagger } from "./animations";
import { Section } from "./section";
import { SectionHeader } from "./section-header";

export function TestimonialsSection() {
  return (
    <Section>
      <SectionHeader
        eyebrow={TESTIMONIALS_SECTION.eyebrow}
        title={TESTIMONIALS_SECTION.headline}
        size="lg"
      />

      <RevealStagger className="grid gap-6 md:grid-cols-3">
        {TESTIMONIALS_SECTION.items.map((t, index) => (
          <motion.figure
            key={t.author}
            {...staggerItemMotion}
            whileHover={{ y: -6 }}
            transition={{ type: "spring", stiffness: 380, damping: 26 }}
            className="group rounded-[16px] bg-white p-7 transition-shadow duration-300 hover:shadow-[0_16px_40px_-16px_rgba(0,0,0,0.18)]"
            style={{
              boxShadow:
                "rgba(0, 0, 0, 0.4) 0px 0px 1px 0px, rgba(0, 0, 0, 0.04) 0px 2px 4px 0px",
            }}
          >
            <blockquote className="font-display text-obsidian text-[20px] leading-[1.35] font-light tracking-[-0.2px]">
              "{t.quote}"
            </blockquote>
            <figcaption className="border-chalk mt-6 flex items-center gap-3 border-t pt-5">
              <motion.span
                aria-hidden
                whileHover={{ rotate: -8, scale: 1.08 }}
                transition={{ type: "spring", stiffness: 400, damping: 18 }}
                className={
                  "inline-flex size-8 items-center justify-center rounded-full text-[13px] font-medium text-white transition-shadow duration-300 group-hover:shadow-[0_4px_12px_-4px_rgba(0,0,0,0.3)] " +
                  (index % 2 === 0 ? "bg-signal-blue" : "bg-ember")
                }
              >
                {t.author.charAt(0)}
              </motion.span>
              <span className="flex flex-col">
                <span className="text-obsidian text-[14px] leading-tight font-medium">
                  {t.author}
                </span>
                <span className="text-gravel text-[13px] leading-tight">
                  {t.role}
                </span>
              </span>
            </figcaption>
          </motion.figure>
        ))}
      </RevealStagger>
    </Section>
  );
}

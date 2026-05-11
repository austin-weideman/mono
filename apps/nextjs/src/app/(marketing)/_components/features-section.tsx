"use client";

import { motion } from "framer-motion";

import { FEATURES_SECTION } from "../_lib/content";
import { RevealItem, RevealStagger } from "./animations";
import { Section } from "./section";
import { SectionHeader } from "./section-header";

export function FeaturesSection() {
  return (
    <Section id="features">
      <SectionHeader
        eyebrow={FEATURES_SECTION.eyebrow}
        title={FEATURES_SECTION.headline}
        size="lg"
      />

      <RevealStagger className="border-chalk grid border-t md:grid-cols-2">
        {FEATURES_SECTION.features.map((feature, index) => (
          <FeatureBlock key={feature.title} feature={feature} index={index} />
        ))}
      </RevealStagger>
    </Section>
  );
}

interface FeatureBlockProps {
  feature: (typeof FEATURES_SECTION.features)[number];
  index: number;
}

function FeatureBlock({ feature, index }: FeatureBlockProps) {
  // Borders draw a clean grid: every cell gets a bottom border, and the right
  // column gets a left border on md+ so the divider is internal to the grid.
  const borderClasses = `border-chalk border-b ${
    index % 2 === 1 ? "md:border-l" : ""
  }`;

  const dotClass = feature.accent === "signal" ? "bg-signal-blue" : "bg-ember";

  return (
    <RevealItem
      className={`${borderClasses} group relative overflow-hidden px-0 py-10 md:px-10`}
    >
      {/* Soft hover wash, fades the powder background in from the left edge. */}
      <span
        aria-hidden
        className="bg-powder pointer-events-none absolute inset-0 -z-10 origin-left scale-x-0 opacity-0 transition-[opacity,transform] duration-500 ease-out group-hover:scale-x-100 group-hover:opacity-100"
      />

      <div className="flex items-center gap-2.5">
        <motion.span
          aria-hidden
          className={`size-2 rounded-full ${dotClass}`}
          whileHover={{ scale: 1.6 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
        />
        <span className="text-obsidian text-[13px] font-medium tracking-[0.3px] uppercase">
          {feature.label}
        </span>
      </div>
      <h3 className="font-display text-obsidian mt-5 text-[24px] leading-[1.2] font-light tracking-[-0.4px] transition-transform duration-300 ease-out group-hover:-translate-y-0.5 md:text-[28px] md:tracking-[-0.5px]">
        {feature.title}
      </h3>
      <p className="text-gravel mt-3 max-w-[480px] text-[15px] leading-[1.55]">
        {feature.description}
      </p>
    </RevealItem>
  );
}

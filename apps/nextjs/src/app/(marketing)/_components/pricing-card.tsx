"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";

import { cn, staggerItemMotion } from "@microlearn/ui";

import type { PRICING } from "../_lib/content";
import { CheckIcon } from "./icons";

interface PricingCardProps {
  tier: (typeof PRICING.tiers)[number];
  /** Pre-rendered server component (e.g. GoogleSignInButton with the action). */
  ctaButton: ReactNode;
}

export function PricingCard({ tier, ctaButton }: PricingCardProps) {
  return (
    <motion.div
      {...staggerItemMotion}
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 380, damping: 26 }}
      className={cn(
        "group relative flex flex-col rounded-[16px] p-8",
        "transition-shadow duration-300 ease-out",
        tier.highlighted
          ? "bg-white hover:shadow-[0_24px_56px_-20px_rgba(0,0,0,0.22)]"
          : "bg-eggshell border-chalk border hover:shadow-[0_16px_40px_-16px_rgba(0,0,0,0.14)]",
      )}
      style={
        tier.highlighted
          ? {
              boxShadow:
                "rgba(0, 0, 0, 0.4) 0px 0px 1px 0px, rgba(0, 0, 0, 0.04) 0px 4px 12px 0px",
            }
          : undefined
      }
    >
      {tier.highlighted && (
        <span className="bg-obsidian text-eggshell absolute -top-3 left-8 inline-flex items-center rounded-full px-3 py-1 text-[11px] font-medium tracking-[0.3px] uppercase">
          Most popular
        </span>
      )}

      <div>
        <h3 className="font-display text-obsidian text-[24px] leading-[1.2] font-light tracking-[-0.4px]">
          {tier.name}
        </h3>
        <p className="text-gravel mt-1 text-[14px]">{tier.description}</p>
      </div>

      <div className="mt-6 flex items-baseline gap-2">
        <span className="font-display text-obsidian text-[44px] leading-none font-light tracking-[-1px]">
          {tier.price}
        </span>
        <span className="text-gravel text-[14px]">{tier.period}</span>
      </div>

      <ul className="mt-8 mb-10 space-y-3">
        {tier.features.map((feature) => (
          <li
            key={feature}
            className="text-obsidian flex items-start gap-3 text-[14px] leading-[1.5]"
          >
            <CheckIcon className="text-obsidian mt-[3px] size-3.5 shrink-0" />
            {feature}
          </li>
        ))}
      </ul>

      <div className="mt-auto">{ctaButton}</div>
    </motion.div>
  );
}

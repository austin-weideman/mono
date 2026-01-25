import { redirect } from "next/navigation";

import { cn } from "@microlearn/ui";

import { getSession } from "~/auth/server";
import { CtaSection } from "../_components/cta-section";
import { GoogleSignInButton } from "../_components/google-sign-in-button";
import { CheckIcon } from "../_components/icons";
import { Section } from "../_components/section";
import { SectionHeader } from "../_components/section-header";
import { PRICING, PRICING_FAQ } from "../_lib/content";

export default async function PricingPage() {
  const session = await getSession();

  if (session) {
    redirect("/chat");
  }

  return (
    <>
      <PricingHero />
      <PricingFaq />
      <CtaSection />
    </>
  );
}

function PricingHero() {
  return (
    <section className="bg-warm-cream relative overflow-hidden px-4 pt-32 pb-20 md:px-8 md:pt-40 md:pb-32">
      <div className="from-warm-gold/30 via-warm-amber/20 absolute top-0 right-0 h-[600px] w-[600px] translate-x-1/3 -translate-y-1/3 rounded-full bg-linear-to-br to-transparent blur-3xl" />
      <div className="from-warm-amber/20 absolute -bottom-32 left-0 h-[520px] w-[520px] -translate-x-1/3 rounded-full bg-linear-to-tr to-transparent blur-3xl" />

      <div className="relative mx-auto max-w-5xl">
        <div className="mb-16 text-center">
          <h1 className="font-display text-warm-brown mb-4 text-4xl font-semibold tracking-tight md:text-6xl">
            {PRICING.headline}
          </h1>
          <p className="text-warm-brown-muted mx-auto max-w-xl text-lg">
            {PRICING.subheadline}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {PRICING.tiers.map((tier) => (
            <PricingCard key={tier.name} tier={tier} />
          ))}
        </div>
      </div>
    </section>
  );
}

interface PricingCardProps {
  tier: (typeof PRICING.tiers)[number];
}

function PricingCard({ tier }: PricingCardProps) {
  return (
    <div
      className={cn(
        "relative rounded-3xl border p-8 transition-all",
        tier.highlighted
          ? "border-warm-amber bg-warm-cream z-10 scale-105 shadow-xl"
          : "border-warm-tan/60 bg-warm-cream-dark/70 hover:border-warm-amber/40 hover:shadow-[0_24px_60px_rgba(58,24,40,0.12)]",
      )}
    >
      {tier.highlighted && (
        <div className="bg-warm-amber absolute -top-4 left-1/2 -translate-x-1/2 rounded-full px-4 py-1">
          <span className="text-sm font-semibold text-white">Most Popular</span>
        </div>
      )}

      <div className="mb-6">
        <h3 className="font-display text-warm-brown text-xl font-semibold">
          {tier.name}
        </h3>
        <p className="text-warm-brown-muted mt-1 text-sm">{tier.description}</p>
      </div>

      <div className="mb-6">
        <span className="font-display text-warm-brown text-4xl font-bold">
          {tier.price}
        </span>
        <span className="text-warm-brown-muted ml-2 text-sm">
          {tier.period}
        </span>
      </div>

      <ul className="mb-8 space-y-3">
        {tier.features.map((feature) => (
          <li
            key={feature}
            className="text-warm-brown-light flex items-start gap-3 text-sm"
          >
            <CheckIcon className="text-warm-amber mt-0.5 size-4 shrink-0" />
            {feature}
          </li>
        ))}
      </ul>

      <GoogleSignInButton
        variant={tier.highlighted ? "primary" : "outline"}
        className="w-full"
      >
        {tier.cta}
      </GoogleSignInButton>
    </div>
  );
}

function PricingFaq() {
  return (
    <Section className="bg-warm-cream-dark" maxWidth="3xl">
      <SectionHeader title="Frequently asked questions" />

      <div className="space-y-6">
        {PRICING_FAQ.map((faq) => (
          <div
            key={faq.question}
            className="bg-warm-cream/90 border-warm-tan/60 rounded-3xl border p-6"
          >
            <h3 className="text-warm-brown mb-2 font-semibold">
              {faq.question}
            </h3>
            <p className="text-warm-brown-muted text-sm leading-relaxed">
              {faq.answer}
            </p>
          </div>
        ))}
      </div>
    </Section>
  );
}

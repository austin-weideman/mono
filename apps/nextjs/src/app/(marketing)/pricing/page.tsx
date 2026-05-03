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
    <section className="px-6 pt-16 pb-20 md:pt-24 md:pb-28">
      <div className="mx-auto max-w-[1000px]">
        <SectionHeader
          eyebrow={PRICING.eyebrow}
          title={PRICING.headline}
          subtitle={PRICING.subheadline}
          centered
          size="lg"
        />

        <div className="grid gap-5 md:grid-cols-2">
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
        "relative flex flex-col rounded-[16px] p-8",
        tier.highlighted ? "bg-white" : "bg-eggshell border-chalk border",
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

      <div className="mt-auto">
        <GoogleSignInButton
          variant={tier.highlighted ? "primary" : "ghost"}
          className="w-full"
        >
          {tier.cta}
        </GoogleSignInButton>
      </div>
    </div>
  );
}

function PricingFaq() {
  return (
    <Section className="border-chalk border-t">
      <div className="mx-auto max-w-[760px]">
        <SectionHeader title="Frequently asked questions" centered />
        <div className="border-chalk border-t">
          {PRICING_FAQ.map((faq) => (
            <div key={faq.question} className="border-chalk border-b py-6">
              <h3 className="text-obsidian text-[16px] font-medium">
                {faq.question}
              </h3>
              <p className="text-gravel mt-2 text-[14px] leading-[1.6]">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

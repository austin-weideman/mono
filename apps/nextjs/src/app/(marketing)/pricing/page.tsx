import { redirect } from "next/navigation";

import { getSession } from "~/auth/server";
import { RevealItem, RevealStagger } from "../_components/animations";
import { CtaSection } from "../_components/cta-section";
import { GoogleSignInButton } from "../_components/google-sign-in-button";
import { PricingCard } from "../_components/pricing-card";
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

        <RevealStagger className="mx-auto grid max-w-[480px] gap-5">
          {PRICING.tiers.map((tier) => (
            <PricingCard
              key={tier.name}
              tier={tier}
              ctaButton={
                <GoogleSignInButton variant="primary" className="w-full">
                  {tier.cta}
                </GoogleSignInButton>
              }
            />
          ))}
        </RevealStagger>
      </div>
    </section>
  );
}

function PricingFaq() {
  return (
    <Section className="border-chalk border-t">
      <div className="mx-auto max-w-[760px]">
        <SectionHeader title="Frequently asked questions" centered />
        <RevealStagger className="border-chalk border-t">
          {PRICING_FAQ.map((faq) => (
            <RevealItem
              key={faq.question}
              className="border-chalk group hover:border-obsidian/30 border-b py-6 transition-colors duration-200"
            >
              <h3 className="text-obsidian text-[16px] font-medium transition-transform duration-200 ease-out group-hover:translate-x-0.5">
                {faq.question}
              </h3>
              <p className="text-gravel mt-2 text-[14px] leading-[1.6]">
                {faq.answer}
              </p>
            </RevealItem>
          ))}
        </RevealStagger>
      </div>
    </Section>
  );
}

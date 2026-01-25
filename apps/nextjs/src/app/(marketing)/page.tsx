import { redirect } from "next/navigation";

import { getSession } from "~/auth/server";
import { CtaSection } from "./_components/cta-section";
import { FeaturesSection } from "./_components/features-section";
import { HeroSection } from "./_components/hero-section";
import { HowItWorksSection } from "./_components/how-it-works-section";
import { TestimonialsSection } from "./_components/testimonials-section";

export default async function LandingPage() {
  const session = await getSession();

  if (session) {
    redirect("/chat");
  }

  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <CtaSection />
    </>
  );
}

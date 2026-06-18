import { redirect } from "next/navigation";

import { getSession } from "~/auth/server";
import { CapabilitiesSection } from "./_components/capabilities-section";
import { ClosingSection } from "./_components/closing-section";
import { LabHero } from "./_components/lab-hero";
import { LoopSection } from "./_components/loop-section";
import { MethodSection } from "./_components/method-section";

export default async function LandingPage() {
  const session = await getSession();

  if (session) {
    redirect("/chat");
  }

  return (
    <>
      <LabHero />
      <LoopSection />
      <CapabilitiesSection />
      <MethodSection />
      <ClosingSection />
    </>
  );
}

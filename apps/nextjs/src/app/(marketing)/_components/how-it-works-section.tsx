import { HOW_IT_WORKS } from "../_lib/content";
import { Section } from "./section";
import { SectionHeader } from "./section-header";

export function HowItWorksSection() {
  return (
    <Section id="how-it-works" className="bg-powder">
      <SectionHeader
        eyebrow={HOW_IT_WORKS.eyebrow}
        title={HOW_IT_WORKS.headline}
        size="lg"
      />

      <div className="grid gap-12 md:grid-cols-3 md:gap-10">
        {HOW_IT_WORKS.steps.map((step) => (
          <div key={step.number} className="border-obsidian/10 border-t pt-6">
            <p className="font-display text-obsidian text-[14px] font-light tracking-[0.4px]">
              {step.number}
            </p>
            <h3 className="font-display text-obsidian mt-4 text-[22px] leading-[1.2] font-light tracking-[-0.4px] md:text-[24px]">
              {step.title}
            </h3>
            <p className="text-gravel mt-3 text-[15px] leading-[1.55]">
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </Section>
  );
}

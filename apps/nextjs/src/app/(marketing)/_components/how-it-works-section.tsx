import { HOW_IT_WORKS } from "../_lib/content";
import { RevealItem, RevealStagger } from "./animations";
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

      <RevealStagger className="grid gap-12 md:grid-cols-3 md:gap-10">
        {HOW_IT_WORKS.steps.map((step) => (
          <RevealItem key={step.number} className="group relative pt-6">
            {/* Top border that animates on hover via origin-left scale */}
            <span
              aria-hidden
              className="border-obsidian/10 absolute top-0 right-0 left-0 border-t"
            />
            <span
              aria-hidden
              className="bg-obsidian absolute top-0 left-0 h-px w-full origin-left scale-x-0 transition-transform duration-500 ease-out group-hover:scale-x-100"
            />

            <p className="font-display text-obsidian inline-block text-[14px] font-light tracking-[0.4px] transition-transform duration-300 ease-out group-hover:-translate-y-0.5">
              {step.number}
            </p>
            <h3 className="font-display text-obsidian mt-4 text-[22px] leading-[1.2] font-light tracking-[-0.4px] md:text-[24px]">
              {step.title}
            </h3>
            <p className="text-gravel mt-3 text-[15px] leading-[1.55]">
              {step.description}
            </p>
          </RevealItem>
        ))}
      </RevealStagger>
    </Section>
  );
}

import { HOW_IT_WORKS } from "../_lib/content";
import { Section } from "./section";
import { SectionHeader } from "./section-header";

export function HowItWorksSection() {
  return (
    <Section
      id="how-it-works"
      className="bg-warm-cream relative"
      maxWidth="5xl"
    >
      <div className="from-warm-gold/30 absolute top-1/2 left-1/2 h-[860px] w-[860px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-linear-to-br to-transparent blur-3xl" />

      <div className="relative">
        <SectionHeader title={HOW_IT_WORKS.headline} />

        <div className="relative">
          <div className="bg-warm-amber/20 absolute top-0 bottom-0 left-8 hidden w-0.5 md:left-1/2 md:block md:-translate-x-1/2" />

          <div className="space-y-12 md:space-y-24">
            {HOW_IT_WORKS.steps.map((step, index) => (
              <div
                key={step.number}
                className={`relative flex flex-col gap-6 md:flex-row md:items-center md:gap-16 ${
                  index % 2 === 1 ? "md:flex-row-reverse" : ""
                }`}
              >
                <div className="hidden md:absolute md:left-1/2 md:block md:-translate-x-1/2">
                  <StepNumber number={step.number} />
                </div>

                <div
                  className={`flex-1 ${index % 2 === 1 ? "md:text-right" : ""}`}
                >
                  <div className="bg-warm-cream/90 border-warm-tan/60 rounded-3xl border p-8 shadow-[0_16px_40px_rgba(58,24,40,0.08)]">
                    <div className="md:hidden">
                      <StepNumber number={step.number} size="small" />
                    </div>

                    <h3 className="font-display text-warm-brown mb-3 text-xl font-semibold">
                      {step.title}
                    </h3>

                    <p className="text-warm-brown-muted leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>

                <div className="hidden flex-1 md:block" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}

interface StepNumberProps {
  number: number;
  size?: "default" | "small";
}

function StepNumber({ number, size = "default" }: StepNumberProps) {
  const sizeClasses =
    size === "default"
      ? "size-12 text-lg shadow-[0_12px_30px_rgba(58,24,40,0.2)]"
      : "size-10 text-sm mb-4 shadow-[0_10px_24px_rgba(58,24,40,0.18)]";

  return (
    <div
      className={`bg-warm-amber text-warm-cream flex items-center justify-center rounded-full font-bold ${sizeClasses}`}
    >
      {number}
    </div>
  );
}

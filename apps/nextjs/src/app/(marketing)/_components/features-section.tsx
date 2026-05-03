import { FEATURES_SECTION } from "../_lib/content";
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

      <div className="border-chalk grid border-t md:grid-cols-2">
        {FEATURES_SECTION.features.map((feature, index) => (
          <FeatureBlock key={feature.title} feature={feature} index={index} />
        ))}
      </div>
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
    <div className={`${borderClasses} px-0 py-10 md:px-10`}>
      <div className="flex items-center gap-2.5">
        <span aria-hidden className={`size-2 rounded-full ${dotClass}`} />
        <span className="text-obsidian text-[13px] font-medium tracking-[0.3px] uppercase">
          {feature.label}
        </span>
      </div>
      <h3 className="font-display text-obsidian mt-5 text-[24px] leading-[1.2] font-light tracking-[-0.4px] md:text-[28px] md:tracking-[-0.5px]">
        {feature.title}
      </h3>
      <p className="text-gravel mt-3 max-w-[480px] text-[15px] leading-[1.55]">
        {feature.description}
      </p>
    </div>
  );
}

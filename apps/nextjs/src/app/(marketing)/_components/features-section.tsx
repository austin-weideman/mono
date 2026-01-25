import { FEATURES } from "../_lib/content";
import { BrainIcon, CalendarIcon, ChartIcon, RefreshIcon } from "./icons";
import { Section } from "./section";
import { SectionHeader } from "./section-header";

const ICON_MAP = {
  calendar: CalendarIcon,
  brain: BrainIcon,
  refresh: RefreshIcon,
  chart: ChartIcon,
} as const;

export function FeaturesSection() {
  return (
    <Section id="features" className="bg-porcelain">
      <SectionHeader
        title="Everything you need to journal deeply"
        subtitle="Guided by memory-aware AI that learns how you think"
      />

      <div className="grid gap-6 md:grid-cols-2">
        {FEATURES.map((feature, index) => {
          const Icon = ICON_MAP[feature.icon];
          return (
            <div
              key={feature.title}
              className="group bg-pearl/90 border-shell/60 hover:border-mauve/40 relative overflow-hidden rounded-3xl border p-8 transition-all hover:shadow-[0_24px_60px_rgba(58,24,40,0.12)]"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="bg-mauve/10 group-hover:bg-mauve/20 mb-6 inline-flex rounded-2xl p-3 transition-colors">
                <Icon className="text-mauve size-6" />
              </div>

              <h3 className="font-display text-ink mb-3 text-xl font-semibold">
                {feature.title}
              </h3>

              <p className="text-ink-muted leading-relaxed">
                {feature.description}
              </p>

              <div className="from-mauve/5 absolute -right-8 -bottom-8 size-32 rounded-full bg-linear-to-br to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
          );
        })}
      </div>
    </Section>
  );
}

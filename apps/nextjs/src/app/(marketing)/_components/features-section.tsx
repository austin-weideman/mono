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
    <Section id="features" className="bg-warm-cream-dark">
      <SectionHeader
        title="Everything you need to learn effectively"
        subtitle="Powered by AI that actually understands how you learn"
      />

      <div className="grid gap-6 md:grid-cols-2">
        {FEATURES.map((feature, index) => {
          const Icon = ICON_MAP[feature.icon];
          return (
            <div
              key={feature.title}
              className="group bg-warm-cream border-warm-tan/50 hover:border-warm-amber/30 relative overflow-hidden rounded-2xl border p-8 transition-all hover:shadow-lg"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="bg-warm-amber/10 group-hover:bg-warm-amber/20 mb-6 inline-flex rounded-xl p-3 transition-colors">
                <Icon className="text-warm-amber size-6" />
              </div>

              <h3 className="font-display text-warm-brown mb-3 text-xl font-semibold">
                {feature.title}
              </h3>

              <p className="text-warm-brown-muted leading-relaxed">
                {feature.description}
              </p>

              <div className="from-warm-amber/5 absolute -right-8 -bottom-8 size-32 rounded-full bg-linear-to-br to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
          );
        })}
      </div>
    </Section>
  );
}

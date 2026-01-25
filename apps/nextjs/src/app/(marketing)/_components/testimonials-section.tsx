import { TESTIMONIALS } from "../_lib/content";
import { Section } from "./section";
import { SectionHeader } from "./section-header";

export function TestimonialsSection() {
  return (
    <Section className="bg-warm-brown relative">
      <div className="from-warm-amber/20 absolute -top-24 right-0 h-[420px] w-[420px] translate-x-1/4 rounded-full bg-linear-to-br to-transparent blur-3xl" />
      <div className="from-warm-gold/30 absolute -bottom-32 left-0 h-[520px] w-[520px] -translate-x-1/4 rounded-full bg-linear-to-tr to-transparent blur-3xl" />
      <SectionHeader
        title="Loved by learners everywhere"
        subtitle="Join thousands who are building lasting knowledge"
        dark
      />

      <div className="relative grid gap-6 md:grid-cols-3">
        {TESTIMONIALS.map((testimonial, index) => (
          <div
            key={testimonial.author}
            className="border-warm-brown-light/60 bg-warm-brown-light/40 relative rounded-3xl border p-8 shadow-[0_20px_40px_rgba(16,10,18,0.35)]"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="text-warm-gold mb-6 text-4xl opacity-60">"</div>

            <blockquote className="text-warm-cream/90 mb-6 leading-relaxed">
              {testimonial.quote}
            </blockquote>

            <div className="flex items-center gap-4">
              <div className="from-warm-amber to-warm-orange flex size-12 items-center justify-center rounded-full bg-linear-to-br">
                <span className="text-lg font-semibold text-white">
                  {testimonial.author.charAt(0)}
                </span>
              </div>
              <div>
                <div className="text-warm-cream font-medium">
                  {testimonial.author}
                </div>
                <div className="text-warm-gold-muted text-sm">
                  {testimonial.role}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

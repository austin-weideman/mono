import { TESTIMONIALS } from "../_lib/content";
import { Section } from "./section";
import { SectionHeader } from "./section-header";

export function TestimonialsSection() {
  return (
    <Section className="bg-warm-brown">
      <SectionHeader
        title="Loved by learners everywhere"
        subtitle="Join thousands who are building lasting knowledge"
        dark
      />

      <div className="grid gap-6 md:grid-cols-3">
        {TESTIMONIALS.map((testimonial, index) => (
          <div
            key={testimonial.author}
            className="bg-warm-brown-light/50 relative rounded-2xl p-8"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="text-warm-gold mb-6 text-4xl opacity-50">"</div>

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

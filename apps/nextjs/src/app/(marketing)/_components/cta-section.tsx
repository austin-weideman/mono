import { CTA } from "../_lib/content";
import { GoogleSignInButton } from "./google-sign-in-button";

export function CtaSection() {
  return (
    <section className="bg-warm-cream relative overflow-hidden px-4 py-20 md:px-8 md:py-32">
      <div className="from-warm-amber/25 via-warm-gold/20 absolute -top-32 -right-32 h-[520px] w-[520px] rounded-full bg-linear-to-br to-transparent blur-3xl" />
      <div className="from-warm-orange/20 absolute -bottom-32 -left-32 h-[420px] w-[420px] rounded-full bg-linear-to-tr to-transparent blur-3xl" />

      <div className="relative mx-auto max-w-3xl text-center">
        <h2 className="font-display text-warm-brown mb-6 text-3xl font-semibold tracking-tight md:text-5xl">
          {CTA.headline}
        </h2>

        <p className="text-warm-brown-muted mx-auto mb-10 max-w-xl text-lg leading-relaxed">
          {CTA.subheadline}
        </p>

        <GoogleSignInButton size="large">{CTA.button}</GoogleSignInButton>

        <p className="text-warm-brown-muted mt-6 text-sm">
          No credit card required. Start learning in seconds.
        </p>
      </div>
    </section>
  );
}

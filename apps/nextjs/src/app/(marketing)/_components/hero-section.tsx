import { HERO } from "../_lib/content";
import { Reveal } from "./animations";
import { GoogleSignInButton } from "./google-sign-in-button";
import { LessonPreviewCard } from "./lesson-preview-card";
import { ScrollLink } from "./scroll-link";

export function HeroSection() {
  return (
    <section className="px-6 pt-16 pb-20 md:pt-24 md:pb-28">
      <div className="mx-auto grid max-w-[1200px] gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,520px)] lg:items-center lg:gap-16">
        <div className="max-w-[640px]">
          <Reveal as="p" className="text-gravel mb-5 text-sm">
            {HERO.eyebrow}
          </Reveal>

          <Reveal delay={0.05}>
            <h1 className="font-display text-obsidian text-[40px] leading-[1.05] font-light tracking-[-0.8px] md:text-[56px] md:leading-[1.04] md:tracking-[-1.12px]">
              {HERO.headline}
            </h1>
          </Reveal>

          <Reveal as="p" delay={0.15}>
            <span className="text-gravel mt-6 block max-w-[560px] text-[16px] leading-[1.55]">
              {HERO.subheadline}
            </span>
          </Reveal>

          <Reveal delay={0.25}>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <GoogleSignInButton variant="primary" size="large">
                {HERO.cta}
              </GoogleSignInButton>
              <ScrollLink
                href="/#how-it-works"
                className="bg-eggshell text-obsidian border-chalk hover:bg-powder inline-flex h-11 items-center justify-center rounded-full border px-5 text-[14px] font-medium transition-[transform,background-color,box-shadow] duration-150 ease-out hover:scale-[1.03] hover:shadow-[0_4px_12px_-6px_rgba(0,0,0,0.15)] active:scale-[0.97]"
              >
                {HERO.ctaSecondary}
              </ScrollLink>
            </div>
          </Reveal>
        </div>

        <LessonPreviewCard />
      </div>
    </section>
  );
}

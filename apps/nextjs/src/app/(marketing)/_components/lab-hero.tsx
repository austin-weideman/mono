import { HERO } from "../_lib/content";
import { Reveal } from "./animations";
import { ArrowButton, FilledButton, GhostButton, PubTag } from "./lab-ui";

// Dark canvas, asymmetric. The four-verb loop set as one architectural block
// of single-weight display type, with massive negative space before the copy
// and a hairline meta strip anchoring the bottom.
export function LabHero() {
  return (
    <section className="bg-abyssal-ink relative overflow-hidden px-6 pt-20 pb-16 md:pt-28 md:pb-24">
      <div className="mx-auto max-w-[1200px]">
        <Reveal>
          <PubTag>{HERO.marker}</PubTag>
        </Reveal>

        <Reveal delay={0.05}>
          <h1 className="text-paper mt-10 text-[clamp(3.25rem,11vw,8.25rem)] leading-[0.92] font-normal tracking-[-0.045em] md:mt-14">
            {HERO.headline.map((word) => (
              <span key={word} className="block">
                {word}
              </span>
            ))}
          </h1>
        </Reveal>

        <div className="mt-16 grid gap-10 md:mt-28 md:grid-cols-[1.1fr_1fr] md:items-end md:gap-16">
          <Reveal delay={0.1}>
            <p className="text-lichen max-w-[34rem] text-[19px] leading-[1.45] tracking-[-0.011em] md:text-[22px]">
              {HERO.subheadline}
            </p>
          </Reveal>

          <Reveal delay={0.18} className="flex flex-wrap items-center gap-3">
            <FilledButton href="/signup">{HERO.cta}</FilledButton>
            <ArrowButton href="/signup" label={HERO.cta} />
            <GhostButton href="/#loop">{HERO.ctaSecondary}</GhostButton>
          </Reveal>
        </div>

        <Reveal delay={0.24}>
          <div className="border-graphite mt-16 flex flex-wrap gap-x-8 gap-y-3 border-t pt-6 md:mt-24">
            {HERO.meta.map((item) => (
              <PubTag key={item}>{item}</PubTag>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

import { CLOSING } from "../_lib/content";
import { Reveal } from "./animations";
import { ArrowButton, FilledButton } from "./lab-ui";

// Final dark band before the void footer. One large statement, one forward
// signal.
export function ClosingSection() {
  return (
    <section className="bg-abyssal-ink border-graphite border-t px-6 py-28 md:py-40">
      <div className="mx-auto flex max-w-[1200px] flex-col items-start gap-8">
        <Reveal>
          <h2 className="text-paper max-w-[20ch] text-[clamp(2.5rem,7vw,5.5rem)] leading-[0.98] tracking-[-0.04em]">
            {CLOSING.headline}
          </h2>
        </Reveal>
        <Reveal delay={0.08}>
          <p className="text-lichen max-w-[46ch] text-[19px] leading-[1.45] tracking-[-0.011em] md:text-[22px]">
            {CLOSING.subheadline}
          </p>
        </Reveal>
        <Reveal delay={0.16} className="flex flex-wrap items-center gap-3">
          <FilledButton href="/signup">{CLOSING.button}</FilledButton>
          <ArrowButton href="/signup" label={CLOSING.button} />
        </Reveal>
        <Reveal delay={0.22}>
          <p className="font-roboto-mono text-graphite text-[13px] tracking-[-0.02em] uppercase">
            {CLOSING.fineprint}
          </p>
        </Reveal>
      </div>
    </section>
  );
}

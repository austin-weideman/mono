import { LOOP } from "../_lib/content";
import { Reveal, RevealItem, RevealStagger } from "./animations";
import { PubTag, SectionCounter } from "./lab-ui";

// Dark band. The closed loop laid out as four stages, read left to right like a
// lab protocol. Hairline separators come from a 1px grid gap over a graphite
// ground, so they stay clean however the grid wraps.
export function LoopSection() {
  return (
    <section
      id="loop"
      className="bg-abyssal-ink scroll-mt-16 px-6 py-24 md:py-32"
    >
      <div className="mx-auto max-w-[1200px]">
        <Reveal className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <SectionCounter index={LOOP.counter} total="03" />
            <PubTag>{LOOP.marker}</PubTag>
          </div>
          <h2 className="text-paper max-w-[18ch] text-[clamp(2.25rem,5vw,3.6rem)] leading-[1.05] tracking-[-0.03em]">
            {LOOP.headline}
          </h2>
          <p className="text-graphite max-w-[52ch] text-[18px] leading-[1.5] tracking-[-0.011em]">
            {LOOP.subheadline}
          </p>
        </Reveal>

        <RevealStagger className="bg-graphite mt-16 grid grid-cols-1 gap-px sm:grid-cols-2 lg:grid-cols-4">
          {LOOP.stages.map((stage) => (
            <RevealItem
              key={stage.label}
              className="bg-abyssal-ink flex flex-col gap-4 p-7 lg:p-8"
            >
              <span className="font-roboto-mono text-bioluminescent-lime text-[13px] tracking-[-0.02em]">
                {stage.step}
              </span>
              <h3 className="text-paper text-[24px] leading-[1.1] tracking-[-0.014em]">
                {stage.label}
              </h3>
              <p className="text-graphite text-[15px] leading-[1.5] tracking-[-0.006em]">
                {stage.description}
              </p>
            </RevealItem>
          ))}
        </RevealStagger>
      </div>
    </section>
  );
}

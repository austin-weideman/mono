import { CAPABILITIES } from "../_lib/content";
import { Reveal, RevealItem, RevealStagger } from "./animations";
import { PubTag, SectionCounter } from "./lab-ui";

// Dark band. A six-cell instrument panel. Same hairline-gap grid as the loop
// so the two dark sections read as one continuous bench.
export function CapabilitiesSection() {
  return (
    <section
      id="capabilities"
      className="bg-abyssal-ink scroll-mt-16 px-6 pb-24 md:pb-32"
    >
      <div className="mx-auto max-w-[1200px]">
        <Reveal className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <SectionCounter index={CAPABILITIES.counter} total="03" />
            <PubTag>{CAPABILITIES.marker}</PubTag>
          </div>
          <h2 className="text-paper max-w-[20ch] text-[clamp(2.25rem,5vw,3.6rem)] leading-[1.05] tracking-[-0.03em]">
            {CAPABILITIES.headline}
          </h2>
        </Reveal>

        <RevealStagger className="bg-graphite mt-16 grid grid-cols-1 gap-px sm:grid-cols-2 lg:grid-cols-3">
          {CAPABILITIES.items.map((item) => (
            <RevealItem
              key={item.label}
              className="bg-abyssal-ink group flex flex-col gap-4 p-7 lg:p-8"
            >
              <PubTag>{item.label}</PubTag>
              <h3 className="text-paper mt-2 text-[22px] leading-[1.15] tracking-[-0.012em]">
                {item.title}
              </h3>
              <p className="text-graphite text-[15px] leading-[1.55] tracking-[-0.006em]">
                {item.description}
              </p>
            </RevealItem>
          ))}
        </RevealStagger>
      </div>
    </section>
  );
}

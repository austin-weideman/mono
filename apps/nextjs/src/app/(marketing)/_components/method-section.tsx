import Link from "next/link";

import { METHOD } from "../_lib/content";
import { Reveal } from "./animations";
import { ArrowIcon, PubTag, SectionCounter } from "./lab-ui";
import { TrajectoryFigure } from "./trajectory-figure";

// The light flip. A bone-white newsroom band carrying the live research
// question, with the generated trajectory figure as its lead image inside a
// dark editorial card.
export function MethodSection() {
  return (
    <section
      id="method"
      className="bg-bone-white text-abyssal-ink scroll-mt-16 px-6 py-24 md:py-32"
    >
      <div className="mx-auto max-w-[1200px]">
        <Reveal className="flex max-w-[60ch] flex-col gap-6">
          <div className="flex items-center gap-4">
            <SectionCounter index={METHOD.counter} total="03" surface="light" />
            <PubTag surface="light">{METHOD.marker}</PubTag>
          </div>
          <h2 className="text-[clamp(2.5rem,6vw,4.2rem)] leading-[1.02] tracking-[-0.035em]">
            {METHOD.headline}
          </h2>
          <p className="text-graphite text-[18px] leading-[1.55] tracking-[-0.011em]">
            {METHOD.body}
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="border-lichen bg-paper mt-14 grid grid-cols-1 gap-10 rounded-[40px] border p-6 md:grid-cols-2 md:gap-12 md:p-10">
            {/* Lead figure: dark scientific render with the lime signal. */}
            <div className="bg-abyssal-ink flex flex-col gap-5 rounded-2xl p-6 md:p-7">
              <TrajectoryFigure />
              <div className="flex flex-wrap gap-x-6 gap-y-2">
                <LegendItem color="var(--color-bioluminescent-lime)">
                  best so far
                </LegendItem>
                <LegendItem color="var(--color-lichen)" ring>
                  measured
                </LegendItem>
                <LegendItem color="var(--color-graphite)" dashed>
                  random floor
                </LegendItem>
              </div>
              <p className="font-roboto-mono text-graphite text-[13px] leading-[1.4] tracking-[-0.02em]">
                {METHOD.figureCaption}
              </p>
            </div>

            {/* The two study controls. */}
            <div className="flex flex-col">
              {METHOD.controls.map((control, idx) => (
                <div
                  key={control.title}
                  className={
                    idx > 0 ? "border-lichen mt-8 border-t pt-8" : undefined
                  }
                >
                  <PubTag surface="light">{control.tag}</PubTag>
                  <h3 className="mt-3 text-[26px] leading-[1.1] tracking-[-0.02em]">
                    {control.title}
                  </h3>
                  <p className="text-graphite mt-3 text-[16px] leading-[1.55] tracking-[-0.008em]">
                    {control.description}
                  </p>
                </div>
              ))}

              <Link
                href="/signup"
                className="font-roboto-mono text-abyssal-ink group mt-8 inline-flex items-center gap-2 text-[13px] tracking-[-0.02em] uppercase"
              >
                Run a campaign
                <ArrowIcon className="size-4 transition-transform duration-150 ease-out group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function LegendItem({
  children,
  color,
  ring,
  dashed,
}: {
  children: React.ReactNode;
  color: string;
  ring?: boolean;
  dashed?: boolean;
}) {
  return (
    <span className="font-roboto-mono text-lichen inline-flex items-center gap-2 text-[12px] tracking-[-0.02em] uppercase">
      {dashed ? (
        <span
          className="h-0 w-3.5 border-t border-dashed"
          style={{ borderColor: color }}
        />
      ) : ring ? (
        <span
          className="size-2 rounded-full border"
          style={{ borderColor: color }}
        />
      ) : (
        <span
          className="size-2 rounded-full"
          style={{ backgroundColor: color }}
        />
      )}
      {children}
    </span>
  );
}

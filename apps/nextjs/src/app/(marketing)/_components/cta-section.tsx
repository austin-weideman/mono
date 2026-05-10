import { CTA } from "../_lib/content";
import { Reveal } from "./animations";
import { GoogleSignInButton } from "./google-sign-in-button";

export function CtaSection() {
  return (
    <section className="border-chalk border-t px-6 py-24 md:py-32">
      <div className="mx-auto flex max-w-[760px] flex-col items-center text-center">
        <Reveal>
          <h2 className="font-display text-obsidian text-[36px] leading-[1.1] font-light tracking-[-0.72px] md:text-[48px] md:leading-[1.08] md:tracking-[-0.96px]">
            {CTA.headline}
          </h2>
        </Reveal>
        <Reveal as="p" delay={0.1}>
          <span className="text-gravel mt-5 block max-w-[520px] text-[16px] leading-[1.55]">
            {CTA.subheadline}
          </span>
        </Reveal>
        <Reveal delay={0.2}>
          <div className="mt-8">
            <GoogleSignInButton variant="primary" size="large">
              {CTA.button}
            </GoogleSignInButton>
          </div>
        </Reveal>
        <Reveal as="p" delay={0.28}>
          <span className="text-slate mt-5 block text-[13px]">
            {CTA.fineprint}
          </span>
        </Reveal>
      </div>
    </section>
  );
}

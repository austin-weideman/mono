import { CTA } from "../_lib/content";
import { GoogleSignInButton } from "./google-sign-in-button";

export function CtaSection() {
  return (
    <section className="border-chalk border-t px-6 py-24 md:py-32">
      <div className="mx-auto flex max-w-[760px] flex-col items-center text-center">
        <h2 className="font-display text-obsidian text-[36px] leading-[1.1] font-light tracking-[-0.72px] md:text-[48px] md:leading-[1.08] md:tracking-[-0.96px]">
          {CTA.headline}
        </h2>
        <p className="text-gravel mt-5 max-w-[520px] text-[16px] leading-[1.55]">
          {CTA.subheadline}
        </p>
        <div className="mt-8">
          <GoogleSignInButton variant="primary" size="large">
            {CTA.button}
          </GoogleSignInButton>
        </div>
        <p className="text-slate mt-5 text-[13px]">{CTA.fineprint}</p>
      </div>
    </section>
  );
}

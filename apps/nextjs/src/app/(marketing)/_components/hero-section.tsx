import { HERO } from "../_lib/content";
import { GoogleSignInButton } from "./google-sign-in-button";
import { ChevronDownIcon } from "./icons";
import { ScrollLink } from "./scroll-link";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden px-4 pt-32 pb-20 md:px-8 md:pt-40 md:pb-32">
      <HeroBackground />

      <div className="relative mx-auto max-w-4xl text-center">
        <Badge>CBT-informed reflection, beautifully guided</Badge>

        <h1 className="font-display text-ink mb-6 text-5xl leading-[1.05] font-semibold tracking-tight md:text-7xl md:leading-[1.03]">
          {HERO.headline}
        </h1>

        <p className="text-ink-muted mx-auto mb-10 max-w-2xl text-lg leading-relaxed md:text-xl">
          {HERO.subheadline}
        </p>

        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <GoogleSignInButton size="large">{HERO.cta}</GoogleSignInButton>

          <ScrollLink
            href="/#how-it-works"
            className="border-shell/70 text-ink-soft hover:text-ink hover:border-mauve/50 inline-flex items-center gap-2 rounded-full border px-6 py-3 text-sm font-medium transition-colors"
          >
            See how it works
            <ChevronDownIcon className="size-4" />
          </ScrollLink>
        </div>
      </div>

      <ChatPreview />
    </section>
  );
}

function HeroBackground() {
  return (
    <div className="absolute inset-0 -z-10">
      <div className="bg-pearl absolute inset-0" />
      <div className="from-mauve/25 via-blush/30 absolute -top-24 right-0 h-[620px] w-[620px] translate-x-1/3 rounded-full bg-linear-to-br to-transparent blur-3xl" />
      <div className="from-rose/20 via-mauve/15 absolute -bottom-24 left-0 h-[520px] w-[520px] -translate-x-1/3 rounded-full bg-linear-to-tr to-transparent blur-3xl" />
      <div className="from-blush/40 absolute top-1/2 left-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-linear-to-br to-transparent blur-3xl" />
      <div className="noise-texture absolute inset-0 opacity-20" />
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="border-shell/60 bg-pearl/80 mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-2 backdrop-blur"
      style={{
        background:
          "linear-gradient(135deg, hsl(332 22% 94%) 0%, hsl(38 36% 94%) 100%)",
      }}
    >
      <span className="bg-mauve size-2 rounded-full" />
      <span className="text-ink-soft text-sm font-medium">{children}</span>
    </div>
  );
}

function ChatPreview() {
  return (
    <div className="mx-auto mt-16 max-w-5xl md:mt-24">
      <div className="border-shell/70 bg-porcelain/60 relative overflow-hidden rounded-3xl border p-2 shadow-2xl">
        <div className="bg-pearl/90 flex items-center gap-2 rounded-t-2xl px-4 py-3 backdrop-blur">
          <div className="flex gap-1.5">
            <div className="size-3 rounded-full bg-rose-300/80" />
            <div className="size-3 rounded-full bg-amber-200/80" />
            <div className="size-3 rounded-full bg-emerald-300/80" />
          </div>
          <div className="bg-shell/60 ml-4 flex-1 rounded-lg py-1.5 text-center">
            <span className="text-ink-muted text-xs">sojourn.app</span>
          </div>
        </div>

        <div className="bg-pearl rounded-b-2xl p-8">
          <div className="mx-auto max-w-md space-y-4">
            <ChatBubble variant="ai">
              How are you feeling right now? Let's name the emotion and explore
              what might be underneath it.
            </ChatBubble>
            <ChatBubble variant="user">
              I'm overwhelmed and keep thinking I'm falling behind.
            </ChatBubble>
            <ChatBubble variant="ai">
              I get it - we've all been there. Is there anything specific that
              might be causing you to feel that way?
            </ChatBubble>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ChatBubbleProps {
  variant: "ai" | "user";
  children: React.ReactNode;
}

function ChatBubble({ variant, children }: ChatBubbleProps) {
  const isAi = variant === "ai";
  return (
    <div
      className={
        isAi
          ? "bg-mauve/10 border-mauve/25 rounded-2xl rounded-bl-sm border p-4"
          : "bg-shell/40 ml-auto w-fit rounded-2xl rounded-br-sm p-4"
      }
    >
      <p className="text-ink text-sm">{children}</p>
    </div>
  );
}

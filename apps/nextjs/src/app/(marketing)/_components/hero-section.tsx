import { HERO } from "../_lib/content";
import { GoogleSignInButton } from "./google-sign-in-button";
import { ChevronDownIcon } from "./icons";
import { ScrollLink } from "./scroll-link";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden px-4 pt-32 pb-20 md:px-8 md:pt-40 md:pb-32">
      <HeroBackground />

      <div className="relative mx-auto max-w-4xl text-center">
        <Badge>Now with adaptive AI memory</Badge>

        <h1 className="font-display text-warm-brown mb-6 text-5xl leading-tight font-semibold tracking-tight md:text-7xl md:leading-tight">
          {HERO.headline}
        </h1>

        <p className="text-warm-brown-muted mx-auto mb-10 max-w-2xl text-lg leading-relaxed md:text-xl">
          {HERO.subheadline}
        </p>

        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <GoogleSignInButton size="large">{HERO.cta}</GoogleSignInButton>

          <ScrollLink
            href="/#how-it-works"
            className="text-warm-brown-light hover:text-warm-brown inline-flex items-center gap-2 px-6 py-4 text-base font-medium transition-colors"
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
      <div className="bg-warm-cream absolute inset-0" />
      <div className="from-warm-gold/20 via-warm-amber/10 absolute top-0 right-0 h-[600px] w-[600px] translate-x-1/3 -translate-y-1/3 rounded-full bg-linear-to-br to-transparent blur-3xl" />
      <div className="from-warm-orange/15 absolute bottom-0 left-0 h-[500px] w-[500px] -translate-x-1/3 translate-y-1/3 rounded-full bg-linear-to-tr to-transparent blur-3xl" />
      <div className="noise-texture absolute inset-0 opacity-30" />
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="mb-6 inline-flex items-center gap-2 rounded-full px-4 py-2"
      style={{
        background:
          "linear-gradient(135deg, hsl(40 33% 94%) 0%, hsl(35 30% 90%) 100%)",
      }}
    >
      <span className="bg-warm-amber size-2 rounded-full" />
      <span className="text-warm-brown-light text-sm font-medium">
        {children}
      </span>
    </div>
  );
}

function ChatPreview() {
  return (
    <div className="mx-auto mt-16 max-w-5xl md:mt-24">
      <div className="border-warm-tan bg-warm-cream-dark/50 relative overflow-hidden rounded-2xl border p-2 shadow-2xl">
        <div className="bg-warm-cream flex items-center gap-2 rounded-t-xl px-4 py-3">
          <div className="flex gap-1.5">
            <div className="size-3 rounded-full bg-red-400/80" />
            <div className="size-3 rounded-full bg-yellow-400/80" />
            <div className="size-3 rounded-full bg-green-400/80" />
          </div>
          <div className="bg-warm-tan/50 ml-4 flex-1 rounded-lg py-1.5 text-center">
            <span className="text-warm-brown-muted text-xs">
              microlearn.app
            </span>
          </div>
        </div>

        <div className="bg-warm-cream rounded-b-xl p-8">
          <div className="mx-auto max-w-md space-y-4">
            <ChatBubble variant="ai">
              Let's learn about compound interest today. This concept is
              fundamental to understanding how money grows over time.
            </ChatBubble>
            <ChatBubble variant="user">
              Can you explain it with an example?
            </ChatBubble>
            <ChatBubble variant="ai">
              Of course! Imagine you invest $1,000 at 5% annual interest...
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
          ? "bg-warm-amber/10 border-warm-amber/20 rounded-2xl rounded-bl-sm border p-4"
          : "bg-warm-tan/30 ml-auto w-fit rounded-2xl rounded-br-sm p-4"
      }
    >
      <p className="text-warm-brown text-sm">{children}</p>
    </div>
  );
}

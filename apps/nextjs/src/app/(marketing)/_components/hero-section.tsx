import { HERO } from "../_lib/content";
import { GoogleSignInButton } from "./google-sign-in-button";
import { ScrollLink } from "./scroll-link";

export function HeroSection() {
  return (
    <section className="px-6 pt-16 pb-20 md:pt-24 md:pb-28">
      <div className="mx-auto grid max-w-[1200px] gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,520px)] lg:items-center lg:gap-16">
        <div className="max-w-[640px]">
          <p className="text-gravel mb-5 text-sm">{HERO.eyebrow}</p>

          <h1 className="font-display text-obsidian text-[40px] leading-[1.05] font-light tracking-[-0.8px] md:text-[56px] md:leading-[1.04] md:tracking-[-1.12px]">
            {HERO.headline}
          </h1>

          <p className="text-gravel mt-6 max-w-[560px] text-[16px] leading-[1.55]">
            {HERO.subheadline}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <GoogleSignInButton variant="primary" size="large">
              {HERO.cta}
            </GoogleSignInButton>
            <ScrollLink
              href="/#how-it-works"
              className="bg-eggshell text-obsidian border-chalk hover:bg-powder inline-flex h-11 items-center justify-center rounded-full border px-5 text-[14px] font-medium transition-colors"
            >
              {HERO.ctaSecondary}
            </ScrollLink>
          </div>
        </div>

        <LessonPreviewCard />
      </div>
    </section>
  );
}

function LessonPreviewCard() {
  return (
    <div
      className="rounded-[16px] bg-white p-2"
      style={{
        boxShadow:
          "rgba(0, 0, 0, 0.4) 0px 0px 1px 0px, rgba(0, 0, 0, 0.04) 0px 4px 12px 0px",
      }}
    >
      <div className="border-chalk flex items-center justify-between rounded-[12px] border-b px-3 py-2.5">
        <div className="flex items-center gap-2">
          <span className="bg-obsidian inline-flex size-4 items-center justify-center rounded-full">
            <span className="bg-eggshell size-1 rounded-full" />
          </span>
          <span className="text-obsidian text-[13px] font-medium">
            Today's lesson
          </span>
        </div>
        <span className="text-gravel text-[12px]">5 min</span>
      </div>

      <div className="grid grid-cols-1 gap-3 p-3 sm:grid-cols-[180px_1fr]">
        <TopicList />
        <ChatPreview />
      </div>
    </div>
  );
}

const TOPICS = [
  { title: "EBITDA", subtitle: "Today", active: true, accent: "signal" },
  {
    title: "Free Cash Flow",
    subtitle: "Tomorrow",
    active: false,
    accent: "ember",
  },
  {
    title: "Working Capital",
    subtitle: "Wed",
    active: false,
    accent: "signal",
  },
  { title: "Discount Rate", subtitle: "Thu", active: false, accent: "ember" },
] as const;

function TopicList() {
  return (
    <div className="hidden flex-col gap-1 sm:flex">
      <p className="text-gravel mb-1 px-2 text-[11px] tracking-[0.4px] uppercase">
        Roadmap
      </p>
      {TOPICS.map((t) => (
        <div
          key={t.title}
          className={
            "flex items-center gap-2.5 rounded-[8px] px-2 py-1.5 " +
            (t.active ? "bg-powder" : "")
          }
        >
          <span
            aria-hidden
            className={
              "size-2 rounded-full " +
              (t.accent === "signal" ? "bg-signal-blue" : "bg-ember")
            }
          />
          <span className="text-obsidian min-w-0 flex-1 truncate text-[13px] font-medium">
            {t.title}
          </span>
          <span className="text-gravel text-[11px]">{t.subtitle}</span>
        </div>
      ))}
    </div>
  );
}

function ChatPreview() {
  return (
    <div className="bg-eggshell flex flex-col gap-2 rounded-[12px] p-3">
      <ChatBubble role="ai">
        EBITDA = Earnings Before Interest, Taxes, Depreciation & Amortization. A
        rough proxy for how much cash a business throws off from operations.
      </ChatBubble>
      <ChatBubble role="user">Why strip out depreciation though?</ChatBubble>
      <ChatBubble role="ai">
        Because it's a non-cash charge — the cash already left when the asset
        was bought. EBITDA tries to isolate ongoing operating performance.
      </ChatBubble>
      <div className="mt-1 flex items-center justify-between">
        <span className="text-gravel text-[12px]">Quiz next →</span>
        <button
          type="button"
          className="bg-obsidian text-eggshell hover:bg-cinder inline-flex h-7 items-center rounded-full px-3 text-[12px] font-medium transition-colors"
        >
          Take quiz
        </button>
      </div>
    </div>
  );
}

interface ChatBubbleProps {
  role: "ai" | "user";
  children: React.ReactNode;
}

function ChatBubble({ role, children }: ChatBubbleProps) {
  if (role === "user") {
    return (
      <div className="border-chalk text-obsidian ml-auto max-w-[85%] rounded-[12px] border bg-white px-3 py-2 text-[12.5px] leading-[1.5]">
        {children}
      </div>
    );
  }
  return (
    <div className="text-obsidian max-w-[90%] text-[12.5px] leading-[1.55]">
      {children}
    </div>
  );
}

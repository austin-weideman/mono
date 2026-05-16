export const SITE = {
  name: "BillSentry",
  tagline: "Watch every bill. Brief every client.",
  description:
    "BillSentry monitors every bill in the California legislature, scores each one against your clients' positions, and drafts the analyses and alerts your team needs, so you can spend your time on strategy, not triage.",
} as const;

export const NAV_LINKS = [
  { label: "Features", href: "/#features" },
  { label: "How it works", href: "/#how-it-works" },
  { label: "Pricing", href: "/pricing" },
] as const;

export const HERO = {
  eyebrow: "Built for California government affairs firms",
  headline: "Every bill, analyzed. Every client, briefed.",
  subheadline:
    "BillSentry uses frontier AI models to deeply analyze every bill in the California legislature for your clients' specific needs.",
  cta: "Get early access",
  ctaSecondary: "How it works",
} as const;

export const FEATURES_SECTION = {
  eyebrow: "What BillSentry does",
  headline: "From bill drop to client memo.",
  features: [
    {
      accent: "signal" as const,
      label: "Proactive monitoring",
      title: "Every bill, evaluated against every client.",
      description:
        "Every new bill and amendment is automatically analyzed against each of your clients' policy positions. Nothing relevant slips past your team; nothing irrelevant wastes their time.",
    },
    {
      accent: "ember" as const,
      label: "Proactive notifications",
      title: "An email the moment something matters.",
      description:
        "When a bill affects your clients, BillSentry emails the right people on your team with the change, the impact, and a suggested position.",
    },
    {
      accent: "signal" as const,
      label: "Chat with any bill",
      title: "Talk to any bill in plain English.",
      description:
        "Ask questions. Surface related bills. Compare amended versions line by line. Every answer cites the specific text or analysis it came from.",
    },
    {
      accent: "ember" as const,
      label: "Client-ready memos",
      title: "First-draft briefings for every client.",
      description:
        "BillSentry produces white-labeled, client-tailored memos and weekly reports. You send under your firm's letterhead.",
    },
  ],
} as const;

export const HOW_IT_WORKS = {
  eyebrow: "How it works",
  headline: "Tell us your clients. We handle the rest.",
  steps: [
    {
      number: "01",
      title: "Profile each client",
      description:
        "Describe each client's policy interests, business context, and bills you're already tracking. Or paste in their existing memos and we'll figure it out.",
    },
    {
      number: "02",
      title: "BillSentry watches every bill",
      description:
        "Every introduction and amendment in the California legislature is read, summarized, and scored against every client profile. Overnight, every night.",
    },
    {
      number: "03",
      title: "Start each day with everything teed up",
      description:
        "Your team opens BillSentry to a queue of scored bills, drafted client memos, and hearing briefs, ready to review and send.",
    },
  ],
} as const;

export const TESTIMONIALS_SECTION = {
  eyebrow: "Designed with practitioners",
  headline: "Built for the way contract firms actually work.",
  items: [
    {
      quote:
        "Tracking sixty bills across twelve clients used to mean our team spent the start of every week just reading. Now they walk in Monday with the reading already done, and spend the day on the work that actually moves the needle.",
      author: "M. Reyes",
      role: "Partner, contract lobbying firm",
    },
    {
      quote:
        "The relevance scoring is the part that surprised us. It catches bills we'd have read past, and quietly skips the noise we'd have spent an hour eliminating.",
      author: "S. Holloway",
      role: "Director of Government Affairs",
    },
    {
      quote:
        "Capitol Track shows you the list. BillSentry tells you which ones matter, why they matter, and hands you a first draft to work from. It's a force multiplier for the team I already have.",
      author: "A. Tanaka",
      role: "Senior Associate, public affairs",
    },
  ],
} as const;

export const CTA = {
  headline: "Goodbye bill tracking. Hello bill understanding.",
  subheadline:
    "BillSentry is taking a small number of California firms into early access. If you represent multiple clients on state policy and want your team focused on the work that matters most, talk to us.",
  button: "Get early access",
  fineprint: "Pilot pricing for California firms. No long-term contract.",
} as const;

export const PRICING = {
  eyebrow: "Pricing",
  headline: "One plan. Per seat. No surprises.",
  subheadline:
    "$100 per seat per month, billed monthly. AI usage is included for typical work. Heavy users move to transparent usage-based pricing, with no overage charges without your say-so.",
  tiers: [
    {
      name: "BillSentry",
      price: "$100",
      period: "per seat / month",
      description: "Everything in the product, for every seat on your team.",
      features: [
        "Unlimited client profiles",
        "California legislature coverage",
        "Proactive relevance flags & email alerts",
        "Chat with any bill, compare versions",
        "Weekly client memo drafts",
        "Hearing briefs & position letters",
        "Shared firm dashboard & assignments",
        "AI usage included for typical work",
        "Monthly billing, cancel anytime",
      ],
      cta: "Apply for pilot",
    },
  ],
} as const;

export const PRICING_FAQ = [
  {
    question: 'What does "AI usage included" actually mean?',
    answer:
      "Every seat comes with a standard amount of AI analysis included. That covers chatting with bills, generating memos, and running relevance checks across your client roster. Heavier use is billed on a usage basis at cost plus a small margin, with a cap you control so you're never charged more than you intend.",
  },
  {
    question: "What happens if I become a heavy user?",
    answer:
      "You set a monthly cap. Any AI usage beyond what's included gets billed at our cost plus a small margin, up to that cap. When the cap is reached, AI stops and we ask you to raise it. No surprise overage charges, ever. You see your usage in dollars in settings at any time.",
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "Yes. Billing is monthly and you can cancel at the end of any cycle. There are no annual contracts during pilot.",
  },
  {
    question: "How do seats work when I add or remove someone?",
    answer:
      "Add a seat mid-cycle and it's billed for the full month with full AI included. Remove a seat and access continues to the end of the cycle, then the charge stops. Simple and predictable.",
  },
  {
    question: "What jurisdictions are covered today?",
    answer:
      "California state legislature at launch: every bill, every amendment, every committee analysis and history record published by the state. Additional states (likely Texas, New York, Florida, Illinois, and federal Congress) are on the roadmap.",
  },
  {
    question: "How accurate is the AI analysis?",
    answer:
      "Every relevance flag and summary cites the specific bill text it's drawn from and is versioned when the underlying bill changes. The product errs toward over-flagging at the classification stage so your team doesn't miss anything. They decide what's signal.",
  },
  {
    question: "Can I export my data?",
    answer:
      "Yes. Client profiles, tracked bills, generated memos, and analyses are all exportable. Your data is yours, including after cancellation.",
  },
] as const;

export const FOOTER = {
  tagline: "Goodbye bill tracking. Hello bill understanding.",
  sections: [
    {
      title: "Product",
      links: [
        { label: "Features", href: "/#features" },
        { label: "How it works", href: "/#how-it-works" },
        { label: "Pricing", href: "/pricing" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About", href: "#" },
        { label: "Contact", href: "#" },
        { label: "Careers", href: "#" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Privacy", href: "#" },
        { label: "Terms", href: "#" },
      ],
    },
  ],
} as const;

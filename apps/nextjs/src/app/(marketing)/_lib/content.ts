export const SITE = {
  name: "MicroLearn",
  tagline: "Learn anything, five minutes at a time",
  description:
    "AI-powered microlearning. A new concept every day, taught in an interactive chat. Build a foundation in any subject — one tiny lesson at a time.",
} as const;

export const NAV_LINKS = [
  { label: "Features", href: "/#features" },
  { label: "How it works", href: "/#how-it-works" },
  { label: "Pricing", href: "/pricing" },
] as const;

export const HERO = {
  eyebrow: "Daily microlearning",
  headline: "A new concept, every day. In five minutes.",
  subheadline:
    "MicroLearn delivers a single, intuitive lesson each day in an interactive AI chat. Ask follow-ups, take a short quiz, build a streak — and master a subject one tiny lesson at a time.",
  cta: "Start learning",
  ctaSecondary: "How it works",
} as const;

export const FEATURES_SECTION = {
  eyebrow: "What you get",
  headline: "Every day, a small idea worth understanding.",
  features: [
    {
      accent: "signal" as const,
      label: "Daily lessons",
      title: "A single concept, taught well.",
      description:
        "Each day, a focused micro-lesson lands in your chat. No bloated curriculum, no twelve-week commitment — just one idea, taught in plain language.",
    },
    {
      accent: "ember" as const,
      label: "Interactive chat",
      title: "Ask anything, anytime.",
      description:
        "Don't follow it? Want a real-world example? Ask. Each lesson is an open conversation with an AI tutor that adapts to how you think.",
    },
    {
      accent: "signal" as const,
      label: "Quiz & mastery",
      title: "Confirm you got it.",
      description:
        "Finish each lesson with a short quiz — one to three questions. We track what you've mastered so you never relearn the same idea twice.",
    },
    {
      accent: "ember" as const,
      label: "Streaks & calendar",
      title: "Five minutes, every day.",
      description:
        "A reminder when it's time to learn. A green check for every day you show up. Months of these add up to a real foundation in a subject.",
    },
  ],
} as const;

export const HOW_IT_WORKS = {
  eyebrow: "How it works",
  headline: "Pick a subject. Show up daily. Get smarter.",
  steps: [
    {
      number: "01",
      title: "Pick a roadmap",
      description:
        "Choose a pre-built track — corporate finance, machine learning, philosophy of mind — or describe a custom subject and we'll generate the curriculum for you.",
    },
    {
      number: "02",
      title: "Chat through today's lesson",
      description:
        "Open the app for five minutes. The AI explains today's concept with intuitive examples and answers your follow-up questions in a back-and-forth chat.",
    },
    {
      number: "03",
      title: "Quiz, master, repeat",
      description:
        "Take a one-minute quiz to lock the idea in. Watch your streak grow on the calendar. Tomorrow, a new concept — built on what you already know.",
    },
  ],
} as const;

export const TESTIMONIALS_SECTION = {
  eyebrow: "Learners",
  headline: "Five minutes a day, compounding.",
  items: [
    {
      quote:
        "I'd been wanting to understand corporate finance for years. Six weeks of MicroLearn and EBITDA, free cash flow, working capital — they actually click now.",
      author: "Maya K.",
      role: "Software Engineer",
    },
    {
      quote:
        "The chat format is the difference. Every time I get stuck I just ask, and it explains it a different way. It's the tutor I never had time to hire.",
      author: "Jasmine R.",
      role: "Designer",
    },
    {
      quote:
        "I have a 47-day streak on philosophy of mind. I would not have committed to a course. I will commit to five minutes before bed.",
      author: "Ari L.",
      role: "Product Lead",
    },
  ],
} as const;

export const CTA = {
  headline: "Start your daily five minutes.",
  subheadline:
    "One concept a day. A streak you'll actually keep. A subject you'll actually learn.",
  button: "Start learning",
  fineprint: "Free to start. No credit card required.",
} as const;

export const PRICING = {
  eyebrow: "Pricing",
  headline: "Simple, transparent pricing.",
  subheadline: "Start free. Upgrade when you want more depth.",
  tiers: [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Everything you need to build the habit.",
      features: [
        "One daily micro-lesson",
        "Interactive AI chat",
        "Streak & calendar tracking",
        "Pre-built roadmaps",
      ],
      cta: "Start free",
      highlighted: false,
    },
    {
      name: "Pro",
      price: "$9",
      period: "per month",
      description: "For learners who want to go deep.",
      features: [
        "Everything in Free",
        "Unlimited custom roadmaps",
        "Advanced topic generation",
        "Multi-lesson days",
        "Mastery review summaries",
        "Year-end learning recap",
        "Priority support",
      ],
      cta: "Start Pro trial",
      highlighted: true,
    },
  ],
} as const;

export const PRICING_FAQ = [
  {
    question: "Can I change plans later?",
    answer:
      "Yes. Upgrade, downgrade, or cancel any time. Changes take effect at the start of your next billing cycle.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "All major credit and debit cards, processed securely through Stripe.",
  },
  {
    question: "Is there a free trial for Pro?",
    answer:
      "Pro includes a 14-day free trial. You're only charged if you decide to continue afterward.",
  },
  {
    question: "What happens to my progress if I cancel?",
    answer:
      "Your learning history is yours. After cancellation you keep read-only access to everything you've mastered, and you can export or delete your data at any time.",
  },
] as const;

export const FOOTER = {
  tagline: "A new concept, every day.",
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
        { label: "Blog", href: "#" },
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

export const SITE = {
  name: "Sojourn",
  tagline: "A private space to understand yourself",
  description:
    "An AI-guided journal that learns how you think. Build a daily habit that helps you feel clearer, calmer, and more in control.",
} as const;

export const NAV_LINKS = [
  { label: "Features", href: "/#features" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Pricing", href: "/pricing" },
] as const;

export const HERO = {
  headline: "A journal that listens and remembers",
  subheadline:
    "A private, AI-guided space for daily reflection. CBT-informed prompts and long-term memory help you understand your emotions and patterns, one gentle entry at a time.",
  cta: "Start Journaling Free",
} as const;

export const FEATURES = [
  {
    title: "Daily Guided Prompts",
    description:
      "A gentle prompt arrives each day to help you unpack feelings and build a consistent journaling habit.",
    icon: "calendar",
  },
  {
    title: "Memory That Knows You",
    description:
      "The AI learns how you think over time, so your journal evolves with you and stays deeply personal.",
    icon: "brain",
  },
  {
    title: "CBT-Informed Reflection",
    description:
      "Evidence-based techniques help you reframe thoughts and build healthier patterns without feeling clinical.",
    icon: "refresh",
  },
  {
    title: "Private Insights",
    description:
      "Track emotional trends, milestones, and gentle progress—always under your control and on your terms.",
    icon: "chart",
  },
] as const;

export const HOW_IT_WORKS = {
  headline: "Journaling made effortless",
  steps: [
    {
      number: 1,
      title: "Create Your Space",
      description:
        "Start with a simple intention. Your journal stays private and adapts to your voice.",
    },
    {
      number: 2,
      title: "Reflect Daily",
      description:
        "Get a thoughtful prompt each day. Speak or type freely while the AI helps you go deeper.",
    },
    {
      number: 3,
      title: "See Yourself Clearly",
      description:
        "Monthly insights and a year-end emotional recap help you notice patterns and celebrate growth.",
    },
  ],
} as const;

export const TESTIMONIALS = [
  {
    quote:
      "It feels like a private conversation with someone who really gets me. The prompts are gentle but powerful.",
    author: "Maya K.",
    role: "Founder",
  },
  {
    quote:
      "I finally built a journaling habit. The daily check-in is simple, and the reflection feels surprisingly deep.",
    author: "Jasmine R.",
    role: "Designer",
  },
  {
    quote:
      "The year-end recap made me emotional in the best way. It helped me see how far I've come.",
    author: "Ari L.",
    role: "Product Lead",
  },
] as const;

export const CTA = {
  headline: "Start your journaling journey today",
  subheadline:
    "Build a daily habit that helps you feel clearer, calmer, and more grounded.",
  button: "Begin for Free",
} as const;

export const PRICING = {
  headline: "Simple, transparent pricing",
  subheadline: "Start free, upgrade when you're ready for deeper insight.",
  tiers: [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for getting started",
      features: [
        "Daily guided prompts",
        "Basic AI reflection",
        "Weekly mood check-ins",
        "Private, secure journaling",
      ],
      cta: "Start Free",
      highlighted: false,
    },
    {
      name: "Pro",
      price: "$9",
      period: "per month",
      description: "For deeper self-understanding",
      features: [
        "Advanced memory system",
        "CBT-informed guidance",
        "Voice journaling",
        "Deep emotional insights",
        "Monthly insight summaries",
        "Year-end emotional recap",
        "Priority support",
      ],
      cta: "Start Pro Trial",
      highlighted: true,
    },
  ],
} as const;

export const PRICING_FAQ = [
  {
    question: "Can I change plans later?",
    answer:
      "Yes. You can upgrade, downgrade, or cancel at any time. Changes take effect at the start of your next billing cycle.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards. Payments are processed securely through Stripe.",
  },
  {
    question: "Is there a free trial for Pro?",
    answer:
      "Yes. Pro includes a 14-day free trial. You'll only be charged if you decide to continue after the trial.",
  },
  {
    question: "What happens to my data if I cancel?",
    answer:
      "Your journal is yours. If you cancel, you'll keep read-only access to your history. You can export or delete your data at any time.",
  },
] as const;

export const FOOTER = {
  tagline: "Build a habit of self-understanding.",
  sections: [
    {
      title: "Product",
      links: [
        { label: "Features", href: "/#features" },
        { label: "Pricing", href: "/pricing" },
        { label: "Roadmap", href: "#" },
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

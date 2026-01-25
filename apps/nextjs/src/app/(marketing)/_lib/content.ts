export const SITE = {
  name: "MicroLearn",
  tagline: "Learn anything, 5 minutes at a time",
  description:
    "Your personal AI tutor that adapts to how you learn. Build lasting knowledge through daily micro-lessons.",
} as const;

export const NAV_LINKS = [
  { label: "Features", href: "/#features" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Pricing", href: "/pricing" },
] as const;

export const HERO = {
  headline: "Build knowledge that lasts",
  subheadline:
    "MicroLearn is your personal AI tutor that remembers how you learn. Spend just 5 minutes a day mastering new concepts—no cramming, no forgetting.",
  cta: "Start Learning Free",
} as const;

export const FEATURES = [
  {
    title: "Daily Micro-Lessons",
    description:
      "Bite-sized lessons designed for busy schedules. Learn something new in the time it takes to drink your morning coffee.",
    icon: "calendar",
  },
  {
    title: "Adaptive AI Memory",
    description:
      "Our AI remembers your learning style, pace, and progress. Every lesson is personalized to how you learn best.",
    icon: "brain",
  },
  {
    title: "Spaced Repetition",
    description:
      "Scientifically-proven techniques ensure concepts move from short-term to long-term memory. Learn once, remember forever.",
    icon: "refresh",
  },
  {
    title: "Progress Tracking",
    description:
      "Watch your knowledge grow with streaks, milestones, and visual progress maps. Stay motivated with daily achievements.",
    icon: "chart",
  },
] as const;

export const HOW_IT_WORKS = {
  headline: "Learning made effortless",
  steps: [
    {
      number: 1,
      title: "Choose Your Subject",
      description:
        "Pick from pre-built roadmaps on topics like finance, history, science, or create your own custom learning path.",
    },
    {
      number: 2,
      title: "Learn Daily",
      description:
        "Receive a personalized micro-lesson each day. Chat with AI to explore concepts deeper, ask questions, and solidify understanding.",
    },
    {
      number: 3,
      title: "Track Progress",
      description:
        "Complete short quizzes, maintain your streak, and watch your mastery grow. The AI adjusts difficulty based on your performance.",
    },
  ],
} as const;

export const TESTIMONIALS = [
  {
    quote:
      "I've tried so many learning apps, but MicroLearn is the first one that actually stuck. The AI feels like a real tutor who knows exactly what I need.",
    author: "Sarah Chen",
    role: "Product Manager",
  },
  {
    quote:
      "As a busy parent, I never thought I'd have time to learn new things. Now I look forward to my 5-minute lessons every morning.",
    author: "Marcus Johnson",
    role: "Software Engineer",
  },
  {
    quote:
      "The adaptive memory is incredible. It somehow knows when I'm about to forget something and brings it back at the perfect time.",
    author: "Elena Rodriguez",
    role: "Medical Student",
  },
] as const;

export const CTA = {
  headline: "Start your learning journey today",
  subheadline:
    "Join thousands of learners building lasting knowledge, one micro-lesson at a time.",
  button: "Get Started Free",
} as const;

export const PRICING = {
  headline: "Simple, transparent pricing",
  subheadline: "Start free, upgrade when you're ready for more.",
  tiers: [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for trying out MicroLearn",
      features: [
        "1 active learning path",
        "Daily micro-lessons",
        "Basic AI chat",
        "Progress tracking",
      ],
      cta: "Start Free",
      highlighted: false,
    },
    {
      name: "Pro",
      price: "$9",
      period: "per month",
      description: "For dedicated learners",
      features: [
        "Unlimited learning paths",
        "Advanced AI memory",
        "Custom roadmaps",
        "Detailed analytics",
        "Priority support",
      ],
      cta: "Start Pro Trial",
      highlighted: true,
    },
    {
      name: "Team",
      price: "$29",
      period: "per month",
      description: "For teams and organizations",
      features: [
        "Everything in Pro",
        "Team dashboards",
        "Shared learning paths",
        "Admin controls",
        "SSO integration",
      ],
      cta: "Contact Sales",
      highlighted: false,
    },
  ],
} as const;

export const PRICING_FAQ = [
  {
    question: "Can I change plans later?",
    answer:
      "Yes! You can upgrade, downgrade, or cancel your plan at any time. Changes take effect at the start of your next billing cycle.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards, PayPal, and Apple Pay. All payments are processed securely through Stripe.",
  },
  {
    question: "Is there a free trial for Pro?",
    answer:
      "Yes! Pro comes with a 14-day free trial. No credit card required to start. You'll only be charged if you decide to continue after the trial.",
  },
  {
    question: "What happens to my data if I cancel?",
    answer:
      "Your learning progress and data are always yours. If you cancel, you'll retain read-only access to your history. You can export your data at any time.",
  },
] as const;

export const FOOTER = {
  tagline: "Build knowledge that lasts.",
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

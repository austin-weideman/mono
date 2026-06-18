export const SITE = {
  name: "Autolab",
  tagline: "Propose. Predict. Measure. Learn.",
  description:
    "Autolab is an AI scientist that runs experiments in a closed loop. It proposes a recipe, commits a prediction, measures the result, and revises, finding the best settings in a handful of tries.",
} as const;

export const NAV_LINKS = [
  { label: "The loop", href: "/#loop" },
  { label: "What it does", href: "/#capabilities" },
  { label: "The study", href: "/#method" },
] as const;

export const HERO = {
  marker: "Autonomous closed-loop experimentation",
  // Rendered as stacked display lines.
  headline: ["Propose.", "Predict.", "Measure.", "Learn."] as const,
  subheadline:
    "Autolab is an AI scientist that runs a real optimization loop with frontier models. It proposes an experiment, commits a numeric prediction, measures the outcome, and revises its theory, one tool call at a time.",
  cta: "Start a campaign",
  ctaSecondary: "See the loop",
  meta: [
    "Reductive amination",
    "768 combinations",
    "20 experiments / campaign",
  ] as const,
} as const;

export const LOOP = {
  counter: "01",
  marker: "The loop",
  headline: "A conversation that converges.",
  subheadline:
    "Every iteration is a structured tool call you can read. The agent commits to a number, sees what the bench returns, and decides what to try next.",
  stages: [
    {
      step: "I",
      label: "Propose",
      description:
        "The agent sets every control variable and calls one tool, run_experiment, with a complete recipe drawn from the parameter space.",
    },
    {
      step: "II",
      label: "Predict",
      description:
        "It commits a numeric prediction of the result before the outcome exists. Calibration becomes something you can measure, not assume.",
    },
    {
      step: "III",
      label: "Measure",
      description:
        "The experiment returns a value through a single execution seam. Today that is a published dataset. Tomorrow it is a simulator or a real lab.",
    },
    {
      step: "IV",
      label: "Learn",
      description:
        "The agent updates an explicit working theory and chooses the next experiment. The feedback is the point, not an afterthought.",
    },
  ],
} as const;

export const CAPABILITIES = {
  counter: "02",
  marker: "What it does",
  headline: "Instrumentation for an AI scientist.",
  items: [
    {
      label: "Closed loop",
      title: "Propose, predict, measure, repeat.",
      description:
        "A genuine optimization loop, not a one-shot answer. The agent searches a space far larger than its budget and has to be strategic about it.",
    },
    {
      label: "Prediction committed",
      title: "Every run ships with a number.",
      description:
        "A prediction is logged before each measurement, then compared against truth. You watch the agent get calibrated in real time.",
    },
    {
      label: "Supervise or automate",
      title: "Steer the agent, or let it run.",
      description:
        "Run fully autonomous, or supervise it. In supervised mode the agent stops after each experiment so you can confirm, steer, or veto by typing.",
    },
    {
      label: "Live trajectory",
      title: "Watch the search converge.",
      description:
        "A live chart plots best so far and predicted versus measured as the campaign runs, right beside the full reasoning transcript.",
    },
    {
      label: "One seam",
      title: "Built to plug into a real bench.",
      description:
        "Execution flows through a single function. Swap the replay dataset for a simulator or a robotic lab and nothing upstream changes.",
    },
    {
      label: "Auditable",
      title: "Numbers in the database, prose in the chat.",
      description:
        "Recipes, predictions, and measurements are structured rows. The reasoning lives in the transcript. Nothing has to be parsed back out.",
    },
  ],
} as const;

export const METHOD = {
  counter: "03",
  marker: "The live question",
  headline: "Is it learning, or remembering?",
  body: "Frontier models already score near the ceiling on these benchmarks, so a leaderboard is not the interesting question. The interesting question is whether the agent uses each result or just recalls a dataset it may have seen in training. Autolab ships that question as a feature, with two controls that run inside the environment, never visible to the agent.",
  controls: [
    {
      tag: "Control A",
      title: "Scrambled feedback",
      description:
        "Each result is swapped for a different recipe's value through a seeded permutation. A learner degrades. A memorizer never notices. Scoring always uses the true measurement.",
    },
    {
      tag: "Control B",
      title: "Hidden names",
      description:
        "Parameter names and option labels are stripped to anonymous symbols. The agent cannot lean on prior chemistry knowledge, so what survives is pure experimental skill.",
    },
  ],
  figureCaption:
    "Best-so-far conversion across a 20-experiment campaign, plotted against the random-sampling floor.",
} as const;

export const CLOSING = {
  headline: "From hypothesis to result, on autopilot.",
  subheadline:
    "Set a goal and a budget, then watch an AI scientist propose, predict, and learn its way to the best answer.",
  button: "Start a campaign",
  fineprint: "No setup. Start optimizing in one message.",
} as const;

export const FOOTER = {
  tagline: "An AI scientist that learns from every result.",
  sections: [
    {
      title: "Explore",
      links: [
        { label: "The loop", href: "/#loop" },
        { label: "What it does", href: "/#capabilities" },
        { label: "The study", href: "/#method" },
      ],
    },
    {
      title: "Get started",
      links: [
        { label: "Start a campaign", href: "/signup" },
        { label: "Log in", href: "/login" },
      ],
    },
  ],
} as const;

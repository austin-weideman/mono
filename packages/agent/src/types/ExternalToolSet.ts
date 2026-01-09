export const ExternalToolSet = {
  EXA: "exa",
} as const;

export type ExternalToolSet =
  (typeof ExternalToolSet)[keyof typeof ExternalToolSet];

import { z } from "zod";

export const createCampaignInputSchema = z.object({
  userId: z.string(),
  title: z.string().nullish(),
  // Determines the objective + parameter space. Only "reductive_amination"
  // exists in core.
  environmentKey: z.string().default("reductive_amination"),
  supervised: z.boolean().default(false),
  hideNames: z.boolean().default(false),
  maxIterations: z.number().int().positive().default(20),
  // Study controls. `scramble` is the UI toggle; when true (and no explicit
  // seed is given) createCampaign mints a random seed. An explicit
  // `scrambleSeed` is used by the headless study for reproducible runs.
  scramble: z.boolean().default(false),
  scrambleSeed: z.number().int().nullish(),
});

export type CreateCampaignInput = z.infer<typeof createCampaignInputSchema>;

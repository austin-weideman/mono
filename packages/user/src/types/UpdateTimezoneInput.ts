import { z } from "zod";

export const updateTimezoneInputSchema = z.object({
  timezone: z.string().min(1),
});

export type UpdateTimezoneInput = z.infer<typeof updateTimezoneInputSchema>;
